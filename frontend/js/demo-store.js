import { demoData } from './demo-data.js';
const DATA_KEY = 'gestao_financeira_portfolio_v1';
const clone = value => JSON.parse(JSON.stringify(value));
const round = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
const users = { master: { id: 1, nome: 'Administrador Demo', login: 'master', perfil: 'master' }, operador: { id: 2, nome: 'Operador Demo', login: 'operador', perfil: 'operador' } };
function freshData() {
  const data = clone(demoData);
  for (const rows of Object.values(data)) for (const row of rows) {
    for (const key of ['data', 'data_emissao', 'data_vencimento', 'compensado_em']) {
      if (row[key]) row[key] = today().slice(0, 7) + row[key].slice(7);
    }
  }
  for (const account of data.contas) account.saldo_inicial = 0;
  data.ajustes = [];
  return data;
}
let memory;
function load() {
  if (memory) return clone(memory);
  try { const saved = JSON.parse(localStorage.getItem(DATA_KEY)); if (saved?.contas && saved?.lancamentos) return saved; } catch {}
  return freshData();
}
function save(data) {
  // Commit storage before reporting success; quota errors leave the previous data intact.
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  memory = clone(data);
}
const byId = (rows, id) => rows.find(row => String(row.id) === String(id));
const exams = row => Array.isArray(row.exames_json) ? row.exames_json : JSON.parse(row.exames_json || '[]');
const inRange = (date, params) => (!params.dataInicio || date >= params.dataInicio) && (!params.dataFim || date <= params.dataFim);
function enrich(data, row) {
  return { ...row, conta_nome: byId(data.contas, row.conta_id)?.nome, categoria_nome: byId(data.categorias, row.categoria_id)?.nome,
    cliente_nome: byId(data.clientes, row.cliente_id)?.nome, fornecedor_nome: byId(data.fornecedores, row.fornecedor_id)?.razao_social,
    conta_origem_nome: byId(data.contas, row.conta_origem_id)?.nome, conta_destino_nome: byId(data.contas, row.conta_destino_id)?.nome };
}
function ledger(data) { return data.lancamentos.map(row => enrich(data, row)); }
function accounts(data) {
  return data.contas.filter(row => row.ativo !== 0).map(account => {
    let balance = Number(account.saldo_inicial || 0);
    for (const row of data.lancamentos) if (String(row.conta_id) === String(account.id) && row.status === 'pago') balance += row.tipo === 'entrada' ? Number(row.valor) : -Number(row.valor);
    for (const row of data.transferencias) {
      if (String(row.conta_origem_id) === String(account.id)) balance -= Number(row.valor);
      if (String(row.conta_destino_id) === String(account.id)) balance += Number(row.valor);
    }
    for (const row of data.ajustes) if (String(row.conta_id) === String(account.id)) balance += Number(row.valor);
    return { ...account, saldo_atual: round(balance) };
  });
}
function reports(data, params) {
  const rows = ledger(data).filter(row => inRange(row.compensado_em || row.data, params));
  const paid = rows.filter(row => row.status === 'pago');
  const total = type => round(paid.filter(row => row.tipo === type).reduce((sum,row) => sum + Number(row.valor),0));
  const saldos = accounts(data), fluxo = {}, despesas = {};
  for (const row of rows) {
    const date = row.compensado_em || row.data;
    fluxo[date] ||= { data: date, entradas: 0, saidas: 0 };
    const key = row.tipo === 'entrada' ? 'entradas' : 'saidas';
    fluxo[date][key] = round(fluxo[date][key] + Number(row.valor));
    if (row.tipo === 'saida') despesas[row.categoria_nome] = round((despesas[row.categoria_nome] || 0) + Number(row.valor));
  }
  return { dashboard: { saldo_total: round(saldos.reduce((sum,row)=>sum+row.saldo_atual,0)), entradas_mes:total('entrada'), saidas_mes:total('saida'), saldos_por_conta:saldos },
    fluxo: Object.values(fluxo).sort((a,b)=>a.data.localeCompare(b.data)), despesas: Object.entries(despesas).map(([categoria,total])=>({categoria,total})) };
}
function outstandingAso(row) {
  return round((row.aso_incluso || row.principal_pago ? 0 : Number(row.valor_aso || 0)) + exams(row).filter(item=>!item.incluso&&!item.pago&&item.realizado).reduce((sum,item)=>sum+Number(item.valor || 0),0));
}
function pending(data) {
  return [
    ...ledger(data).filter(row=>row.status==='pendente' && (!row.origem_tipo || row.origem_tipo==='manual')).map(row=>({...row,origem:'lancamento'})),
    ...data.contas_pagar.filter(row=>row.status==='pendente').map(row=>({...enrich(data,row),origem:'conta_pagar',tipo:'saida',data:row.data_vencimento})),
    ...data.cobrancas.filter(row=>row.status==='pendente').map(row=>({...enrich(data,row),origem:'cobranca',tipo:'entrada',data:row.data_vencimento})),
    ...data.asos.filter(row=>outstandingAso(row)>0).map(row=>({...enrich(data,row),origem:'aso',tipo:'entrada',valor:outstandingAso(row),descricao:`ASO - ${row.funcionario_nome}`})),
  ];
}
function filteredLedger(data, params) {
  return ledger(data).filter(row=>inRange(row.data, params) && ['tipo','status'].every(key=>!params[key]||row[key]===params[key]) && (!params.contaId||String(row.conta_id)===String(params.contaId)) && (!params.categoriaId||String(row.categoria_id)===String(params.categoriaId)))
    .sort((a,b)=>b.data.localeCompare(a.data)||b.id-a.id);
}
function add(data, table, payload) {
  const row = { ...payload, id: Math.max(0,...data[table].map(row=>Number(row.id)))+1 };
  data[table].push(row); return row;
}
function normalize(payload) {
  const row = {...payload}; delete row.id;
  for (const key of ['valor','valor_aso','valor_exames','saldo_atual','total_parcelas','parcela_atual']) if (key in row) row[key] = Number(row[key] || 0);
  for (const key of ['aso_incluso','exames_incluso','exames_complementares','recorrente']) if (key in row) row[key] = row[key]===true || row[key]===1 || row[key]==='1' || row[key]==='on';
  return row;
}
function resolveAccount(data, row) {
  const id = row.forma_pagamento === 'dinheiro' ? data.contas.find(a=>a.nome==='Caixa')?.id : row.conta_id;
  if (!byId(data.contas,id)) throw new Error('Selecione uma conta válida.');
  return Number(id);
}
function addPayment(data, row, value, type, source, category) {
  if (!value) return;
  const conta_id = resolveAccount(data,row);
  add(data,'lancamentos',{tipo:type,valor:round(value),data:row.compensado_em || row.data || row.data_vencimento,conta_id,categoria_id:category,
    descricao:row.descricao || `ASO - ${row.funcionario_nome}`,status:'pago',forma_pagamento:row.forma_pagamento||'pix',origem_tipo:source,origem_id:row.id});
}
function syncAso(data, row) {
  data.lancamentos = data.lancamentos.filter(item=>!(item.origem_tipo==='aso'&&String(item.origem_id)===String(row.id)));
  const category = data.categorias.find(item=>item.nome==='Receita ASO')?.id;
  if (!row.aso_incluso && row.principal_pago) addPayment(data,row,Number(row.valor_aso||0),'entrada','aso',category);
  for (const exam of exams(row)) if (exam.pago && !exam.incluso) addPayment(data,{...row,forma_pagamento:exam.forma_pagamento,conta_id:exam.conta_id},Number(exam.valor||0),'entrada','aso',category);
  row.valor_exames = round(exams(row).reduce((sum,item)=>sum+Number(item.valor||0),0));
  row.status = outstandingAso(row)>0 ? 'pendente' : 'pago';
}
const tableMap = { lancamentos:'lancamentos',categorias:'categorias',contas:'contas',clientes:'clientes',fornecedores:'fornecedores',asos:'asos','contas-pagar':'contas_pagar',cobrancas:'cobrancas',transferencias:'transferencias' };
export async function demoRequest(path, options = {}, token) {
  const url = new URL(path,'https://demo.invalid'), parts = url.pathname.split('/').filter(Boolean), params = Object.fromEntries(url.searchParams);
  const method = options.method || 'GET', payload = normalize(JSON.parse(options.body || '{}'));
  if (path==='/auth/login') {
    if (!users[payload.login] || payload.senha!=='demo123') throw new Error('Use master ou operador com a senha demo123.');
    return { token:`portfolio:${payload.login}`,user:clone(users[payload.login]) };
  }
  const user = users[String(token || '').replace('portfolio:','')];
  if (!user || !String(token).startsWith('portfolio:')) throw new Error('Entre na demonstração para continuar.');
  if (parts[0]==='auth') return {user:clone(user)};
  let data = load();
  if (method==='GET') {
    const report = reports(data,params);
    if (parts[0]==='resumo-inicial') return clone({user,dashboard:report.dashboard,contas:accounts(data),categorias:data.categorias,clientes:data.clientes,fornecedores:data.fornecedores,cobrancas:data.cobrancas.map(row=>enrich(data,row)),lancamentos:filteredLedger(data,{...params,dataInicio:params.lancamentosDataInicio||params.dataInicio,dataFim:params.lancamentosDataFim||params.dataFim}),transferencias:data.transferencias.map(row=>enrich(data,row)),contas_fixas:[],contas_pagar:data.contas_pagar.map(row=>enrich(data,row)),pendencias:pending(data),asos:data.asos.map(row=>enrich(data,row)),relatorio_fluxo:report.fluxo,relatorio_despesas:report.despesas});
    if (parts[0]==='dashboard') return clone(report.dashboard);
    if (parts[0]==='relatorios') return clone(parts[1]==='fluxo'?report.fluxo:report.despesas);
    if (parts[0]==='compensacoes') return clone(pending(data));
    if (parts[0]==='contas' && parts[2]==='movimentacoes') {
      const conta=byId(accounts(data),parts[1]);
      const movements=ledger(data).filter(row=>String(row.conta_id)===parts[1]).map(row=>({...row,data_movimento:row.compensado_em||row.data,origem:'lancamento'}));
      for (const row of data.transferencias) if ([String(row.conta_origem_id),String(row.conta_destino_id)].includes(parts[1])) movements.push({...row,data_movimento:row.data,tipo:String(row.conta_origem_id)===parts[1]?'saida':'entrada',status:'pago',origem:'transferencia'});
      for (const row of data.ajustes) if (String(row.conta_id)===parts[1]) movements.push({...row,data_movimento:row.data,tipo:row.valor>=0?'entrada':'saida',valor:Math.abs(row.valor),status:'pago',origem:'ajuste de caixa'});
      return clone({conta,movimentacoes:movements.filter(row=>inRange(row.data_movimento,params)).sort((a,b)=>b.data_movimento.localeCompare(a.data_movimento))});
    }
    if (parts[0]==='lancamentos') return clone(filteredLedger(data,params));
    const table=tableMap[parts[0]]; if (table) return clone(table==='contas'?accounts(data):data[table].map(row=>enrich(data,row)));
    throw new Error('Tela não disponível na demonstração.');
  }
  if ((method==='DELETE'||method==='PUT'||parts[0]==='admin') && user.perfil!=='master') throw new Error('Entre como master para esta ação.');
  if (parts[0]==='admin') { data=freshData(); save(data); return {mensagem:'Exemplos restaurados.'}; }
  if (parts[0]==='compensacoes') {
    const table=tableMap[parts[1]], row=byId(data[table]||[],parts[2]);
    if (!row) throw new Error('Registro não encontrado.');
    if (row.status==='pago') return clone(enrich(data,row));
    Object.assign(row,payload,{compensado_em:payload.data_compensacao || today()});
    if (table==='lancamentos') {row.conta_id=resolveAccount(data,row); row.status='pago';}
    else if (table==='asos') {row.principal_pago=true;row.exames_json=exams(row).map(item=>item.realizado&&!item.incluso?{...item,pago:true,forma_pagamento:row.forma_pagamento,conta_id:row.conta_id}:item);syncAso(data,row);}
    else {row.conta_id=resolveAccount(data,row);addPayment(data,row,row.valor,table==='contas_pagar'?'saida':'entrada',table==='contas_pagar'?'conta_pagar':'cobranca',row.categoria_id||data.categorias.find(c=>c.tipo==='entrada').id);row.status='pago';}
    save(data); return clone(enrich(data,row));
  }
  const table=tableMap[parts[0]];
  if (!table) throw new Error('Operação não disponível.');
  const old=byId(data[table],parts[1]);
  if (method!=='POST' && !old) throw new Error('Registro não encontrado.');
  if (method==='DELETE') {
    const references={categorias:'categoria_id',contas:'conta_id',clientes:'cliente_id',fornecedores:'fornecedor_id'};
    if (references[table] && Object.values(data).some(rows=>rows.some(row=>row!==old && (String(row[references[table]])===parts[1] || (table==='contas' && [String(row.conta_origem_id),String(row.conta_destino_id)].includes(parts[1])))))) throw new Error('Este cadastro possui movimentações vinculadas.');
    if (table==='lancamentos' && old.origem_tipo && old.origem_tipo!=='manual') throw new Error('Edite o registro na tela de origem.');
    data[table]=data[table].filter(row=>row!==old);
    data.lancamentos=data.lancamentos.filter(row=>!(row.origem_tipo===({asos:'aso',contas_pagar:'conta_pagar',cobrancas:'cobranca'}[table])&&String(row.origem_id)===parts[1]));
    save(data); return null;
  }
  if ('valor' in payload && (!Number.isFinite(payload.valor)||payload.valor<=0)) throw new Error('Informe um valor maior que zero.');
  if (['lancamentos','transferencias','asos','contas_pagar','cobrancas'].includes(table)) {
    for (const [key,target] of Object.entries({categoria_id:'categorias',cliente_id:'clientes',fornecedor_id:'fornecedores',conta_origem_id:'contas',conta_destino_id:'contas'})) if (payload[key] && !byId(data[target],payload[key])) throw new Error('Cadastro relacionado inválido.');
  }
  if (table==='lancamentos') { if(old?.origem_tipo && old.origem_tipo!=='manual') throw new Error('Edite o registro na tela de origem.'); payload.conta_id=resolveAccount(data,payload); payload.origem_tipo='manual'; }
  if (table==='transferencias' && String(payload.conta_origem_id)===String(payload.conta_destino_id)) throw new Error('Selecione contas diferentes.');
  if (table==='categorias'||table==='contas') if (data[table].some(row=>row!==old&&row.nome.toLowerCase()===String(payload.nome).toLowerCase())) throw new Error('Nome já cadastrado.');
  if (table==='contas') {
    if (old) {const before=byId(accounts(data),old.id).saldo_atual;add(data,'ajustes',{conta_id:old.id,valor:round(payload.saldo_atual-before),data:today(),descricao:payload.observacao||'Ajuste demonstrativo'});}
    else payload.saldo_inicial=payload.saldo_atual||0;
    payload.ativo=1;
  }
  if (table==='contas_pagar' && method==='POST') {
    const count=payload.tipo==='parcelada'?Math.max(1,Math.min(120,payload.total_parcelas||1)):1;
    const first=Math.max(1,payload.parcela_atual||1), results=[];
    for(let installment=first;installment<=count;installment++) {const [y,m,d]=payload.data_vencimento.split('-').map(Number);const date=new Date(y,m-1+installment-first,1);const day=Math.min(d,new Date(date.getFullYear(),date.getMonth()+1,0).getDate());const dateText=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;results.push(add(data,table,{...payload,parcela_atual:installment,total_parcelas:count,data_vencimento:dateText,status:'pendente'}));}
    save(data);return clone(results);
  }
  const row = old ? Object.assign(old,payload) : add(data,table,{status:'pendente',...payload});
  if (table==='asos') {row.principal_pago=payload.status==='pago';row.exames_json=exams(row);syncAso(data,row);}
  if (['contas_pagar','cobrancas'].includes(table)) {
    const source=table==='contas_pagar'?'conta_pagar':'cobranca';
    data.lancamentos=data.lancamentos.filter(item=>!(item.origem_tipo===source&&String(item.origem_id)===String(row.id)));
    if (row.status==='pago') addPayment(data,row,row.valor,table==='contas_pagar'?'saida':'entrada',source,row.categoria_id||data.categorias.find(c=>c.tipo==='entrada').id);
  }
  save(data); return clone(enrich(data,row));
}
export function restoreDemo() { save(freshData()); }
