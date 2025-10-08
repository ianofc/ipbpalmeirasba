// botResponses.js

export const botResponses = {
    horarios: {
        keywords: ['1', 'horário', 'horarios', 'culto', 'cultos'],
        response: 'Os cultos acontecem nos seguintes horários:\n- Domingo: Escola Dominical às 10:00 e Culto Solene às 19:00\n- Terça-feira: Congregação Vila Jason Alves às 19:30\n- Quarta-feira: Culto de Oração às 19:30\n- Sexta-feira: Culto de Doutrina às 19:30'
    },
    oracao: {
        keywords: ['2', 'oração', 'oracao', 'orar', 'pedido'],
        response: 'Ficarei feliz em ajudar com seu pedido de oração! Clique aqui para enviar seu pedido diretamente ao Pastor Josué: https://wa.me/5575991437628'
    },
    doacao: {
        keywords: ['3', 'doar', 'doação', 'doacao', 'ofertar', 'dizimo'],
        response: 'Para fazer uma doação à igreja, você pode usar:\nPIX: (chave)\nConta Bancária: (dados)\nSua contribuição é muito importante para nossa missão!'
    },
    visita: {
        keywords: ['4', 'visita', 'pastor', 'conversar'],
        response: 'Que bom que você quer agendar uma visita pastoral! Clique aqui para falar diretamente com o Pastor Josué: https://wa.me/5575991437628'
    },
    historia: {
        keywords: ['5', 'história', 'historia', 'passado', 'palmeiras'],
        response: 'A história da Igreja Presbiteriana em Palmeiras é fascinante! A igreja foi estabelecida em Villa Bella das Palmeiras, enfrentando inicialmente forte resistência da comunidade local. Um dos pioneiros mais importantes foi João Capistrano de Souza, ordenado em 1912, que se tornou um dos primeiros pastores nacionais na Bahia. Ele foi fundamental para estabelecer e consolidar a presença presbiteriana na região, sendo também um defensor da emancipação de Palmeiras.'
    },
    doutrina: {
        keywords: ['6', 'doutrina', 'presbiteriana', 'crença', 'fé', 'reforma'],
        response: 'A Igreja Presbiteriana segue a tradição reformada, baseada nos ensinos de João Calvino. Nossas doutrinas principais estão registradas na Confissão de Fé de Westminster e nos Catecismos Maior e Breve. Temos documentos disponíveis para download em nosso site, incluindo o Manual Presbiteriano 2019, que explica nossa forma de governo e doutrinas. Gostaria de saber mais sobre algum aspecto específico?'
    },
    ipb: {
        keywords: ['7', 'ipb', 'brasil', 'presbiterianismo'],
        response: 'O presbiterianismo chegou ao Brasil no século XIX, em um período de grandes transformações sociais e religiosas. A Missão Central do Brasil, organizada sob diretrizes de Nova Iorque, não apenas evangelizava, mas também promovia educação e saúde. Essa abordagem holística visava melhorar as condições de vida das pessoas, especialmente em áreas remotas do país.'
    },
    lideranca: {
        keywords: ['8', 'pastor', 'presbiteros', 'presbíteros', 'diaconos', 'diáconos', 'liderança', 'lideranca'],
        response: 'Nossa liderança é composta por:\n\nPastor:\n- Rev. Josué Nunes de Oliveira\n\nPresbíteros:\n- Marcos Cruz\n- Davi\n\nDiáconos:\n- Elvis Soares\n- Bruno\n- Marcos Souza'
    },
    organizacoes: {
        keywords: ['9', 'organizações', 'organizacoes', 'grupos', 'departamentos'],
        response: 'Nossa igreja possui as seguintes organizações:\n\n- UCP (União de Crianças Presbiterianas): Dedicada ao ensino e crescimento espiritual das crianças\n- UPA (União de Adolescentes Presbiterianos): Espaço para adolescentes se conectarem e aprenderem sobre a fé\n- UMP (União de Mocidade Presbiteriana): Voltada para jovens adultos\n- UPH (União Presbiteriana de Homens): Reúne homens para estudos e serviço comunitário\n- SAF (Sociedade Auxiliadora Feminina): Grupo dedicado ao trabalho feminino na igreja'
    }
};

const initialMessage = 'Olá, tudo bem? Sou a Sarcinha, a chatboot da IPB - Palmeiras! 😊\n\nPosso ajudar você com:\n1 - Horários dos cultos\n2 - Pedidos de oração\n3 - Doações\n4 - Agendamento de visitas pastorais\n5 - História da nossa igreja\n6 - Doutrina presbiteriana\n7 - História da IPB\n8 - Liderança da igreja\n9 - Nossas organizações\n\nDigite o número da opção desejada ou me conte como posso ajudar!';

const defaultFallback = 'Desculpe, não entendi sua pergunta. Por favor, escolha uma das opções:\n1 - Horários dos cultos\n2 - Pedidos de oração\n3 - Doações\n4 - Agendamento de visitas pastorais';

export { initialMessage, defaultFallback };
