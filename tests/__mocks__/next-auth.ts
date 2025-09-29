// Mock for next-auth in tests
export const getServerSession = jest.fn()

export const authOptions = {
  providers: [],
  callbacks: {},
  pages: {}
}

export default {
  getServerSession,
  authOptions
} 