export const demoData = {
  "categorias": [
    {
      "id": 1,
      "nome": "Outros recebimentos",
      "tipo": "entrada"
    },
    {
      "id": 2,
      "nome": "Receita ASO",
      "tipo": "entrada"
    },
    {
      "id": 3,
      "nome": "Aluguel",
      "tipo": "saida"
    },
    {
      "id": 4,
      "nome": "Energia",
      "tipo": "saida"
    },
    {
      "id": 5,
      "nome": "Internet",
      "tipo": "saida"
    },
    {
      "id": 6,
      "nome": "Fornecedores",
      "tipo": "saida"
    },
    {
      "id": 7,
      "nome": "Salarios",
      "tipo": "saida"
    },
    {
      "id": 8,
      "nome": "Marketing",
      "tipo": "saida"
    },
    {
      "id": 9,
      "nome": "Manutencao",
      "tipo": "saida"
    },
    {
      "id": 10,
      "nome": "Despesas diversas",
      "tipo": "saida"
    }
  ],
  "contas": [
    {
      "id": 1,
      "nome": "Caixa",
      "saldo_atual": 1720,
      "ativo": 1
    },
    {
      "id": 2,
      "nome": "SICOOB",
      "saldo_atual": 500,
      "ativo": 1
    },
    {
      "id": 3,
      "nome": "Cresol",
      "saldo_atual": 0,
      "ativo": 1
    },
    {
      "id": 4,
      "nome": "Banco do Brasil",
      "saldo_atual": 0,
      "ativo": 1
    }
  ],
  "clientes": [
    {
      "id": 1,
      "nome": "Cliente Exemplo Aurora (ficticio)",
      "telefone": null,
      "email": "aurora@example.invalid",
      "documento": null,
      "aso_incluso": 0,
      "exames_incluso": 0,
      "exames_inclusos_json": "[]"
    },
    {
      "id": 2,
      "nome": "Cliente Exemplo Horizonte (ficticio)",
      "telefone": null,
      "email": "horizonte@example.invalid",
      "documento": null,
      "aso_incluso": 0,
      "exames_incluso": 0,
      "exames_inclusos_json": "[]"
    }
  ],
  "fornecedores": [
    {
      "id": 1,
      "razao_social": "Fornecedor Exemplo Papelaria (ficticio)",
      "cnpj": null,
      "contato_nome": "Contato ficticio",
      "telefone": null,
      "categoria": "Materiais",
      "ativo": 1
    },
    {
      "id": 2,
      "razao_social": "Fornecedor Exemplo Tecnologia (ficticio)",
      "cnpj": null,
      "contato_nome": null,
      "telefone": null,
      "categoria": "Informatica",
      "ativo": 1
    }
  ],
  "lancamentos": [
    {
      "id": 1,
      "tipo": "entrada",
      "valor": 2400,
      "data": "2026-10-01",
      "forma_pagamento": "dinheiro",
      "conta_id": 1,
      "categoria_id": 1,
      "descricao": "Recebimento ficticio de demonstracao",
      "recorrente": 0,
      "status": "pago",
      "conta_fixa_id": null,
      "origem_tipo": "manual",
      "origem_id": null,
      "compensado_em": null,
      "criado_em": "2026-10-06 17:33:26"
    },
    {
      "id": 2,
      "tipo": "saida",
      "valor": 180,
      "data": "2026-10-02",
      "forma_pagamento": "dinheiro",
      "conta_id": 1,
      "categoria_id": 6,
      "descricao": "Compra ficticia de materiais",
      "recorrente": 0,
      "status": "pago",
      "conta_fixa_id": null,
      "origem_tipo": "manual",
      "origem_id": null,
      "compensado_em": null,
      "criado_em": "2026-10-06 17:33:26"
    },
    {
      "id": 3,
      "tipo": "entrada",
      "valor": 850,
      "data": "2026-10-15",
      "forma_pagamento": "pix",
      "conta_id": 2,
      "categoria_id": 1,
      "descricao": "Recebimento ficticio pendente",
      "recorrente": 0,
      "status": "pendente",
      "conta_fixa_id": null,
      "origem_tipo": "manual",
      "origem_id": null,
      "compensado_em": null,
      "criado_em": "2026-10-06 17:33:26"
    }
  ],
  "asos": [
    {
      "id": 1,
      "data": "2026-10-04",
      "cidade": "Cidade Exemplo",
      "cliente_id": 1,
      "funcionario_nome": "Pessoa Exemplo (ficticia)",
      "tipo_aso": "periodico",
      "exames_complementares": 0,
      "exames_json": null,
      "valor_aso": 120,
      "valor_exames": 0,
      "categoria_cobranca": "cliente",
      "forma_pagamento": null,
      "conta_id": null,
      "status": "pendente",
      "compensado_em": null,
      "aso_incluso": 0,
      "exames_incluso": 0,
      "lancamento_id": null,
      "criado_em": "2026-10-06 17:33:26"
    }
  ],
  "transferencias": [
    {
      "id": 1,
      "conta_origem_id": 1,
      "conta_destino_id": 2,
      "valor": 500,
      "data": "2026-10-03",
      "descricao": "Transferencia ficticia de demonstracao"
    }
  ],
  "contas_pagar": [
    {
      "id": 1,
      "descricao": "Materiais ficticios de demonstracao",
      "tipo": "fixa",
      "valor": 320,
      "total_parcelas": 1,
      "parcela_atual": 1,
      "categoria_id": 6,
      "conta_id": null,
      "cliente_id": null,
      "forma_pagamento": null,
      "fornecedor_id": 1,
      "fornecedor": null,
      "data_vencimento": "2026-10-20",
      "status": "pendente",
      "compensado_em": null,
      "lancamento_id": null,
      "criado_em": "2026-10-06 17:33:26"
    }
  ],
  "cobrancas": [
    {
      "id": 1,
      "cliente_id": 1,
      "descricao": "Servico ficticio de demonstracao",
      "valor": 650,
      "data_emissao": "2026-10-01",
      "data_vencimento": "2026-10-18",
      "status": "pendente",
      "compensado_em": null,
      "observacao": "Sem validade comercial",
      "lancamento_id": null,
      "criado_em": "2026-10-06 17:33:26"
    }
  ]
};
