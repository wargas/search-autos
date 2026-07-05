export type SearchResponse = {
    took: number
    timed_out: boolean
    _shards: {
      total: number
      successful: number
      skipped: number
      failed: number
    }
    hits: {
      total: {
        value: number
        relation: string
      }
      max_score: number
      hits: Array<{
        _index: string
        _id: string
        _score: number
        _source: {
          protocolo: string
          acaoFiscalprotocolo: string
          descricaoFatos: string
          geaf: string
          especie: string
          natureza: string
          dataLavratura: string
          infracao: string
          situacao: string
          acaoFiscal: {
            protocolo: string
            auditor: string
            identificao: string
            nome: string
            dataGeracao: string
            tipo: string
            abordagem: string
          }
        }
      }>
    }
  }

  export type ProcessoFiscal = {
    protocolo: string
    acaoFiscalprotocolo: string
    descricaoFatos: string
    geaf: string
    especie: string
    natureza: string
    dataLavratura: string
    infracao: string
    situacao: string
    acaoFiscal: {
      protocolo: string
      auditor: string
      identificao: string
      nome: string
      dataGeracao: string
      tipo: string
      abordagem: string
    }
  }
  