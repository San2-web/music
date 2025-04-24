// 测试脚本

// 测试数据
const testLyrics = [
  {
    title: '测试歌曲1',
    artist: '测试歌手1',
    content: '这是一段测试歌词内容'.repeat(50), // 超长内容测试
    tags: ['测试', '长文本']
  },
  {
    title: '测试歌曲2',
    artist: '测试歌手2',
    content: '短歌词',
    tags: ['测试', '短文本']
  },
  ...Array(50).fill().map((_, i) => ({
    title: `批量测试歌曲${i+1}`,
    artist: `批量测试歌手${i+1}`,
    content: `这是第${i+1}首测试歌词`.repeat(5),
    tags: ['批量', '测试']
  })) // 大量卡片测试
];

// 功能完整性测试
function testFunctionality() {
  console.log('=== 开始功能完整性测试 ===');
  
  // 测试卡片创建
  const testCard = createLyricCard(testLyrics[0]);
  if (!testCard) {
    console.error('❌ 卡片创建失败');
    return;
  }
  console.log('✅ 卡片创建功能正常');
  
  // 测试复制功能
  try {
    const mockClipboard = {
      writeText: jest.fn()
    };
    global.navigator.clipboard = mockClipboard;
    
    const copyBtn = testCard.querySelector('button');
    copyBtn.click();
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith(testLyrics[0].content);
    console.log('✅ 复制功能正常');
  } catch (e) {
    console.error('❌ 复制功能测试失败:', e);
  }
}

// 边界测试
function testBoundaryConditions() {
  console.log('=== 开始边界条件测试 ===');
  
  // 测试大量卡片渲染性能
  console.time('渲染50张卡片耗时');
  testLyrics.slice(0, 50).forEach(lyric => {
    document.getElementById('app').appendChild(createLyricCard(lyric));
  });
  console.timeEnd('渲染50张卡片耗时');
  
  // 测试超长内容显示
  const longContentCard = createLyricCard(testLyrics[0]);
  const contentEl = longContentCard.querySelector('p');
  if (contentEl.scrollHeight > contentEl.clientHeight) {
    console.log('✅ 超长内容截断功能正常');
  } else {
    console.error('❌ 超长内容截断功能异常');
  }
}

// 响应式测试
function testResponsive() {
  console.log('=== 开始响应式测试 ===');
  
  // 模拟不同屏幕尺寸
  const sizes = [
    {name: '手机', width: 375},
    {name: '平板', width: 768},
    {name: '桌面', width: 1024}
  ];
  
  sizes.forEach(size => {
    window.innerWidth = size.width;
    window.dispatchEvent(new Event('resize'));
    
    const grid = document.getElementById('app');
    const computedStyle = window.getComputedStyle(grid);
    
    let expectedColumns = '1';
    if (size.width >= 768) expectedColumns = '2';
    if (size.width >= 1024) expectedColumns = '3';
    
    if (computedStyle.gridTemplateColumns.split(' ').length === parseInt(expectedColumns)) {
      console.log(`✅ ${size.name}布局正常`);
    } else {
      console.error(`❌ ${size.name}布局异常`);
    }
  });
}

// 运行所有测试
function runTests() {
  // 清空现有内容
  document.getElementById('app').innerHTML = '';
  
  testFunctionality();
  testBoundaryConditions();
  testResponsive();
  
  // 恢复原始数据
  setTimeout(() => {
    document.getElementById('app').innerHTML = '';
    initApp();
  }, 3000);
}

// 导出测试函数供HTML按钮调用
window.runTests = runTests;