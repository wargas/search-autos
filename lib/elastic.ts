import { Client } from '@elastic/elasticsearch'
export const elastic = new Client({
    node: 'https://search.deltex.com.br',
    auth: {
        username: 'elastic',
        password: 'Wrgs2703!'
    }
})