import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: resolve(process.cwd(), '.env.test') })
