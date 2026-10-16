import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultList60Paths } from './paths.ts'

test('default list60 paths stay on the mailer endpoints', () => {
  assert.equal(defaultList60Paths.index, '/mailer/list60')
  assert.equal(defaultList60Paths.membership(14), '/mailer/audience/14/list60')
})
