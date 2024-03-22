# Curso Opentelemetry Udemy
https://tecom.udemy.com/course/observability-in-cloud-native-apps-using-opentelemetry/
Repo: https://github.com/habmic/opentelemetry-101/tree/main

## Pasos
1 - Instalar módulos localmente ejecutando: yarn
  - Correr docker-compose up -> En este punto no hay telemetría instalada
  - Test: http://localhost:8081/todos

2 - Instalar Opentelemetry, Jaeger, y crear tracer.ts [ver](./docs/installing-opentelemetry.md)
  - Correr docker-compose up -> En este punto tenemos telemetría sólo de traces con OpenTelemetry
  - Jaeger: http://localhost:16686/search

3 - Agregamos métricas con prometheus [ver](./docs/adding-metrics.md)
  - Prometheus: http://localhost:9090/graph -> Al punto anterior, sumamos métricas

4 - Correlación de Traces y Logs [ver](./docs/correlate-logs-with-traces.md)
  - Cuando llamemos a http://localhost:8081/todos?fail=1 se va a generar un error 500 que podemos ver correlacionado con el trace en los logs y en Jaeger

5 - Creación manual de Spans [ver](./docs/creating-manual-spans.md)
  - De esta forma generamos un Span de forma manual para el código que se ejecuta dentro, y lo vemos en Jaeger como operation: Set default items

6 - Atributos personalizados en los Spans (Tags en Jaeger) [ver](./docs/adding-custom-attributes.md)
  - Nos permite agregar atributos adicionales a los generados automáticamente por Opentelemetry en los Spans, por ej. un nombre de usuario

7 - Configuración de instrumentaciones: Cada instrumentación puede configurarse según los parámetros que encontramos en la [documentación](https://opentelemetry.io/ecosystem/registry/?language=js&component=instrumentation). Es posible incluso desactivar módulos de instrumentación automática que no deseamos incorporar en los spans, ver [tracer.ts](./tracer.ts)

8 - Logs Debug [ver](./docs/debug-logs.md) -> Habilita los logs de opentelemetry en la consola con el nivel seteado (DEBUG/ERROR/WARNING, etc.)

9 - Resources: agregan en los Span información sobre el entorno en que se ejecuta la aplicación de forma automática (Campo Process en Jaeger), además podemos agregar entradas personalizadas [ver](./docs/define-custom-resources.md)

10 - Sampling: Por defecto, Opentelemetry toma muestra de todo lo instrumentado en la aplicación, es decir, genera Spans para cualquier librería compatible instrumentada. Esto hace que por ejemplo, las llamadas desde Prometheus para relevar métricas, también generen traces/spans, y esto no es deseado en producción. [Ver](./docs/configure-sampling.md)

11 - Context Propagation: Esta funcionalidad nos permite propagar el contexto de opentelemetry de un Span a otro, mediante 3 estándares: W3C, B3, o Jaeger. Por defecto usamos W3C, y  a menos que no especifiquemos nada, es el que se utiliza siempre. [VER](./docs/context-propagation-and-baggage.md)

12 - Configuración con variables de entorno: Dependen del lenguaje de programación, pero permiten configuarar aspectos del funcionamiento de Opentelemetry sin alterar el código

13 - Performance: Permite modificar la cantidad de procesamiento requerido para analizar y generar los spans, tipos: Batch(default, producción), Simple(menos performante) Sin Procesador(debug) 




