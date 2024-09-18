import { sum } from "../src/sum"
import { describe, test, expect } from "@jest/globals"

describe('Sum function', () => {
    test('Returns correct value', () => {
        expect(sum(2, 3)).toEqual(5)
    })
})