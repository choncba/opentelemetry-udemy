import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
// Manejo de Samples
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { OurSampler } from './OurSampler';
// Context Propagation
import {W3CBaggagePropagator, W3CTraceContextPropagator, CompositePropagator} from '@opentelemetry/core'

function start(serviceName: string) {
    const traceExporter = new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
    });

    const sdk = new NodeSDK({
        traceExporter,
        serviceName:serviceName,
        instrumentations: [getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs":{           // Esta instrumentación es automática, por config podemos desactivarla
                enabled:false
            },
            // Lo agrego para visualizar context propagation, no necesario
            "@opentelemetry/instrumentation-http":{
                headersToSpanAttributes:{
                    client:{
                        requestHeaders:['tracestate','traceparent','baggage']
                    },
                    server:{
                        requestHeaders:['tracestate','traceparent','baggage']
                    }
                }
            }
        })],
        // Agrego Resources automáticos y personalizados a los Spans
        autoDetectResources: true,
        resource: new Resource({
          'team': 'Factory Backend',
          'version': '2.17.0'
        }),
        // Agrego lógica que define cuándo generar muestras
        sampler: new ParentBasedSampler({
            root: new OurSampler()
        }),
        // Context Propagation
        textMapPropagator: new CompositePropagator({
            propagators:[new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
        })
    });

    const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;
    const exporter = new PrometheusExporter({}, () => {
        console.log(
          `prometheus scrape endpoint: http://localhost:${port}${endpoint}`,
        );
      });
    const meterProvider = new MeterProvider({
            resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });    
    
    meterProvider.addMetricReader(exporter);
    const meter = meterProvider.getMeter('my-service-meter');

    sdk.start();

    return meter;
}

export default start