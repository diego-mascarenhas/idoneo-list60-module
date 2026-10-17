import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultList60Paths } from './paths.ts'

test('default list60 paths stay on the mailer endpoints', () => {
  assert.equal(defaultList60Paths.index, '/mailer/list60')
  assert.equal(defaultList60Paths.membership(14), '/mailer/audience/14/list60')
  assert.equal(defaultList60Paths.interaction(14), '/mailer/audience/14/interactions')
  assert.equal(defaultList60Paths.summarize, '/assistant/follow-up/summarize')
  assert.equal(defaultList60Paths.responsible(9), '/assistant/list60/9/responsible')
  assert.equal(defaultList60Paths.advisors, '/users?assignable=1')
})
