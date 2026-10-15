import { elastic } from "@/lib/elastic"

export default async function() {
    const data  = await elastic.indices.getMapping({
        // index: 'auto_infracao'
    })
    return <div>
        {JSON.stringify(data)}
    </div>
}