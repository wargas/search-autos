import { Client } from '@elastic/elasticsearch'
export const elastic = new Client({
    node: 'https://search.deltex.com.br',
    auth: {
        apiKey: process.env.ELASTIC_API_KEY!
    }
})