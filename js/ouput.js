//第二阶段的输出
function outputViaDOM(result) {
  let currentGua = result.currentGua;
  let futureGua = result.futureGua;

  d3.selectAll('h1#stage2').style('opacity', 1);
  let outputSentences = d3.select('div.description').style('width', '100%');

  //变爻序列
  let currentChangedYaoArray = result.currentGua.yaoArray.filter((yao) => /老/.test(yao.property));

  //概述
  let ifChangeExist = '无变爻。';
  if (currentGua !== futureGua) {
    ifChangeExist =
      '变爻为<span style = "color:red;">' + currentChangedYaoArray.map((yao) => yao.yaoName).join('、') + '</span>。';
  }
  const endResult =
    '此次占卜结果：本卦' +
    currentGua.doubleSymbol +
    '《' +
    currentGua.doubleName +
    '》，之卦' +
    futureGua.doubleSymbol +
    '《' +
    futureGua.doubleName +
    '》，' +
    ifChangeExist;
  outputSentences.append('p').classed('overview', true).html(endResult);
  outputSentences.append('br');

  //本卦卦辞
  let row = outputSentences.append('div').classed('row', true);
  //5格宽度
  row
    .append('div')
    .attr('class', 'col-lg-6 col-md-6')
    .append('p')
    .classed('guaSentence', true)
    .text('《' + currentGua.doubleName + '》：' + currentGua.sentence);
  //5格宽度
  row
    .append('div')
    .attr('class', 'col-lg-6 col-md-6')
    .append('p')
    .classed('guaSentence', true)
    .text('揣摩爻辞含义，可参考互证的单变爻');

  //本卦变爻爻辞
  printYaoSentence(result.currentGua);

  //之卦卦辞
  if (currentGua !== futureGua) {
    outputSentences.append('br');
    outputSentences
      .append('p')
      .classed('guaSentence', true)
      .text('《' + futureGua.doubleName + '》：' + futureGua.sentence);
  }

  //之卦变爻爻辞
  if (currentChangedYaoArray.length > 0) {
    printYaoSentence(result.futureGua);
  }

  //打印爻辞的函数
  function printYaoSentence(gua) {
    for (let i = 0; i < 6; i++) {
      //新建一行
      let row = outputSentences.append('div').classed('row', true);
      //本卦爻辞，5格宽度
      row
        .append('div')
        .attr('class', 'col-lg-6 col-md-6')
        .append('p')
        .text('《' + gua.yaoArray[i].guaName + '》' + gua.yaoArray[i].yaoName + '：' + gua.yaoArray[i].sentence)
        .attr('class', /老/.test(gua.yaoArray[i].property) ? 'changedYao' : 'unchangedYao');
      //相关爻辞，5格宽度
      row
        .append('div')
        .attr('class', 'col-lg-6 col-md-6')
        .append('p')
        .text(
          '《' + gua.corrYaoArray[i].guaName + '》' + gua.corrYaoArray[i].yaoName + '：' + gua.corrYaoArray[i].sentence
        );
    }
  }
  renderExplanation(endResult);
}
function renderExplanation(endResult) {
  var options = {
    method: 'POST',
    url:
      'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-tiny-8k?access_token=' +
      '24.72e51227ded9c1e3b79f94bd99e02417.2592000.1731740058.282335-115902331',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: `解释以下卦辞，并给出解释：${endResult}`,
        },
      ],
      temperature: 0.95,
      top_p: 0.7,
      penalty_score: 1,
    }),
  };

  d3.selectAll('h1#stage3').style('opacity', 1);
  let outputSentences = d3.select('div.explanation').style('width', '100%');
  axios(options)
    .then((response) => {
      if (response?.data?.result) {
        const result = response.data.result
          .replace('好的，根据您提供的卦辞，这是一个占卜结果，我将为您解释卦辞的含义并给出解释。\n\n', '')
          .replace(/\\n\\n/g, '<br>');
        result.split('\n\n').forEach((line, index) => {
          if (index >= 1) {
            outputSentences
              .append('p')
              .classed('overview', true)
              .html('&nbsp&nbsp' + line);
          }
        });
        // outputSentences.append('p').classed('overview', true).html(result);
        // outputSentences.append('br');
      } else {
        throw new Error('卦辞渲染失败');
      }
    })
    .catch((error) => {
      outputSentences.style('opacity', 1);
      outputSentences.append('p').classed('overview', true).html(error);
    });
}
