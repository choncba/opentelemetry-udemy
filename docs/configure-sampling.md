- Genero el archivo OurSampler.ts, donde defino las condiciones para que la muestra se genere o no:

```ts
import { Attributes, Context, Link, SpanKind } from "@opentelemetry/api";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import {Sampler, SamplingResult, SamplingDecision } from "@opentelemetry/sdk-trace-base";
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
const { endpoint } = PrometheusExporter.DEFAULT_OPTIONS;


export class OurSampler implements Sampler {
    shouldSample(context: Context, traceId: string, spanName: string, spanKind: SpanKind, attributes: Attributes, links: Link[]): SamplingResult {
        if(attributes[SemanticAttributes.HTTP_TARGET] === endpoint){
            return {
                decision:SamplingDecision.NOT_RECORD
            }
        }

        return {
            decision:SamplingDecision.RECORD_AND_SAMPLED
        }
    }
}
```

- Agrego las dependencias y configuración del sampler en NodeSDK de en tracer.ts
```ts
import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { OurSampler } from './ourSampler';

...

    const sdk = new NodeSDK({
        ...
        sampler: new ParentBasedSampler({
            root: new OurSampler()
        }),
        ...
    });
```