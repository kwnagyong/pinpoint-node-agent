/**
 * Pinpoint Node.js Agent
 * Copyright 2020-present NAVER Corp.
 * Apache License v2.0
 */

const test = require('tape')
const {
  log,
  fixture,
  util
} = require('../test-helper')

const Span = require('../../lib/context/span')
const SpanEvent = require('../../lib/context/span-event')
const SpanEventRecorder = require('../../lib/context/span-event-recorder')

const ServiceTypeCode = require('../../lib/constant/service-type').ServiceTypeCode
const GeneralMethodDescriptor = require('../../lib/constant/method-descriptor').GeneralMethodDescriptor

test('Should create span event recorder', async function (t) {
  t.plan(2)

  const span = new Span(fixture.getTraceId(), fixture.getAgentInfo())
  const spanEvent = new SpanEvent(span.spanId, 0)
  const spanEventRecorder = new SpanEventRecorder(spanEvent, span)
  spanEventRecorder.recordServiceType(ServiceTypeCode.express)
  spanEventRecorder.recordApi(GeneralMethodDescriptor.SERVER_REQUEST)
  t.ok(spanEventRecorder.spanEvent)

  spanEventRecorder.spanEvent.startTime = Date.now()
  await util.sleep(101)
  spanEventRecorder.spanEvent.markElapsedTime()
  t.ok(spanEventRecorder.spanEvent.endElapsed > 100)
})

const agent = require('../support/agent-singleton-mock')
test.skip(`spanevent with async_hooks`, async function (t) {
  agent.bindHttp()

  t.plan(5)

  const trace = agent.createTraceObject()
  trace.startSpanEvent(new SpanEventRecorder.builder()
    .setServiceType(ServiceTypeCode.redis)
    .setApiDesc('redis.get.call')
    .setDestinationId('destinationId')
    .setEndPointIP('127.0.0.1')
    .setEndPointPort(9334))

  t.true(trace.callStack.length == 1, `spanEvent call stack is one`)
  t.equal(trace.spanEventRecorder.spanEvent.serviceType, ServiceTypeCode.redis, "redis")
  t.equal(trace.spanEventRecorder.spanEvent.annotations[0].value.stringValue, 'redis.get.call', 'redis call')
  t.equal(trace.spanEventRecorder.spanEvent.destinationId, 'destinationId', 'destinationId')
  t.equal(trace.spanEventRecorder.spanEvent.endPoint, '127.0.0.1:9334', 'endpoint')
})