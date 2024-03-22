import start from './tracer';
const meter = start('todo-service');
import express from 'express';
import axios from 'axios';
import opentelemetry from "@opentelemetry/api";
const app = express();

import Redis from "ioredis";
import { api } from '@opentelemetry/sdk-node';
const redis = new Redis({host:'redis'});

// Metricas
const calls = meter.createHistogram('http-calls');

app.use((req,res,next)=>{
    const startTime = Date.now();
    req.on('end',()=>{
        const endTime = Date.now();
        calls.record(endTime-startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method
        })
    })
    next();
})

const sleep = (time: number) => { return new Promise((resolve) => { setTimeout(resolve, time) }) };

app.get('/todos', async (req, res) => {
    // Defino el baggage que será agregado al contexto
    const baggage = opentelemetry.propagation.createBaggage({
        'user.plan': {
            value: "enterprise"
        }
    });

    // Genero un nuevo contexto de Opentelemetry
    const contextWithBaggage= opentelemetry.propagation.setBaggage(opentelemetry.context.active(), baggage);
    
    opentelemetry.context.with(contextWithBaggage, async () => {
        // Ejecuto la llamada en el nuevo contexto
        const user = await axios.get('http://auth:8080/auth');
        const todoKeys = await redis.keys('todo:*');
        const todos: any = [];
        for (let i = 0; i < todoKeys.length; i++) {
            const todoItem = await redis.get(todoKeys[i])
            if (todoItem) {
                todos.push(JSON.parse(todoItem));
            }
        }

        // Introducimos algunas opciones en la query para hacerlo más lento
        if(req.query['slow']){
            await sleep(1000);
        }

        // Correlaciona el log de error con la información del trace
        if (req.query['fail']) {
            try {
                throw new Error('Really bad error!')
            } catch (e: any) {
                const activeSpan = api.trace.getSpan(api.context.active());
                activeSpan?.recordException(e)
                console.error('Really bad error!', {
                    spanId: activeSpan?.spanContext().spanId,
                    traceId: activeSpan?.spanContext().traceId,
                    traceFlag: activeSpan?.spanContext().traceFlags,
                });
                res.sendStatus(500);
                return;
            }
        }

        res.json({ todos, user:user.data });
    });


})

app.listen(8080, () => {
    console.log('service is up and running!');
})


async function init() {
    // De esta forma generamos un Span de forma manual para el código que se ejecuta dentro, y lo vemos en Jaeger como operation: Set default items
    opentelemetry.trace.getTracer('init').startActiveSpan('Set default items', async (span) => {
        // Application code goes here

        await Promise.all([
            redis.set('todo:1', JSON.stringify({ name: 'Install OpenTelemetry SDK' })),
            redis.set('todo:2', JSON.stringify({ name: 'Deploy OpenTelemetry Collector' })),
            redis.set('todo:3', JSON.stringify({ name: 'Configure sampling rule' })),
            redis.set('todo:4', JSON.stringify({ name: 'You are OpenTelemetry master!' }))]
        );

        span.end();
    })

}
init();
