import { z } from 'zod'

test('number coercion', () => {
  const schema = z.coerce.number()

  expect(schema.parse(null)).toBe(0)
  expect(schema.safeParse(undefined).success).toBeFalsy()
})

test('coercion string -> number', () => {
  const schema = z.string().pipe(z.coerce.number())

  expect(schema.parse('1')).toBe(1)
  expect(schema.parse('')).toBe(0)
  expect(schema.safeParse(null).success).toBeFalsy()
  expect(schema.safeParse(undefined).success).toBeFalsy()
})

test('coercion string -> number null', () => {
  const schema = z.string().nullable().pipe(z.coerce.number())

  expect(schema.parse(null)).toBe(0)
  expect(schema.safeParse(undefined).success).toBeFalsy()
})

test('coercion string -> number undefined', () => {
  const schema = z.string().nullish().default('0').pipe(z.coerce.number())

  expect(schema.parse(null)).toBe(0)
  expect(schema.parse(undefined)).toBe(0)
})

const Client = z.object({
  id: z.string().transform((s) => (s.length === 0 ? null : Number(s))),
  username: z.string(),
})

// client(Form) 데이터 타입
type Client = z.input<typeof Client>

// 서버 POST
// type Request = z.output<typeof Client>

// server GET -> client
const Response = Client.extend({
  id: z
    .number()
    .nullable()
    .transform((n) => n ?? 0)
    .pipe(z.coerce.string()),
})
// 서버 GET 데이터 타입
type Response = z.input<typeof Response>

test('서버 GET -> client', () => {
  expect(Response.parse({ id: 1, username: 'name' })).toEqual({
    id: '1',
    username: 'name',
  })

  expect(Response.parse({ id: null, username: 'name' })).toEqual({
    id: '0',
    username: 'name',
  })
})

test('클라이언트 -> 서버 POST', () => {
  expect(Client.parse({ id: '1', username: 'name' })).toEqual({
    id: 1,
    username: 'name',
  })
  expect(Client.parse({ id: '', username: 'name' })).toEqual({
    id: null,
    username: 'name',
  })
})
