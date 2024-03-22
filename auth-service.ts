import start from './tracer';
start('auth-service'); 
import express from 'express';
import opentelemetry from "@opentelemetry/api";
const app = express();

app.get('/auth',(req,res)=>{

    // Extraigo el contexto de Opentelemetry y lo muestro
    const baggage = opentelemetry.propagation.getActiveBaggage();
    console.log('baggage',baggage);

    res.json({username: 'Michael Haberman', userId: 132});

    // Puedo agregar uno o múltiples atributos (Tags) personalizados al Span
    // opentelemetry.trace.getActiveSpan()?.setAttribute('userId',123);
    opentelemetry.trace.getActiveSpan()?.setAttributes({
        userId: 123,
        Prueba: "Sacala"
    });
})

app.listen(8080, () => {
    console.log('service is up and running!');
})