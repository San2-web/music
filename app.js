// 获取DOM元素
const app = document.getElementById('app');
const filterSelect = document.createElement('select');

// 从JSON文件加载歌词数据
async function loadLyrics() {
  const response = await fetch('lyrics.json');
  const data = await response.json();
  return data.lyrics;
}

// 创建歌词卡片
function showEditModal(lyric) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'bg-gray-800 rounded-xl p-6 w-full max-w-2xl';
  
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'w-full p-2 mb-4 bg-gray-700 text-white rounded';
  titleInput.value = lyric.title;
  titleInput.placeholder = '歌曲标题';
  
  const artistInput = document.createElement('input');
  artistInput.type = 'text';
  artistInput.className = 'w-full p-2 mb-4 bg-gray-700 text-white rounded';
  artistInput.value = lyric.artist;
  artistInput.placeholder = '歌手';
  
  const contentTextarea = document.createElement('textarea');
  contentTextarea.className = 'w-full p-2 mb-4 bg-gray-700 text-white rounded h-40';
  contentTextarea.value = lyric.content;
  contentTextarea.placeholder = '歌词内容';
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg';
  saveBtn.textContent = '保存';
  saveBtn.addEventListener('click', () => {
    lyric.title = titleInput.value;
    lyric.artist = artistInput.value;
    lyric.content = contentTextarea.value;
    
    // 更新本地存储
    updateLyricsData(lyric);
    
    // 重新渲染卡片
    document.getElementById('app').innerHTML = '';
    initApp();
    
    // 关闭模态框
    modal.remove();
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg ml-4';
  cancelBtn.textContent = '取消';
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  const btnContainer = document.createElement('div');
  btnContainer.className = 'flex justify-end';
  btnContainer.appendChild(saveBtn);
  btnContainer.appendChild(cancelBtn);
  
  modalContent.appendChild(titleInput);
  modalContent.appendChild(artistInput);
  modalContent.appendChild(contentTextarea);
  modalContent.appendChild(btnContainer);
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function updateLyricsData(updatedLyric) {
  fetch('lyrics.json')
    .then(response => response.json())
    .then(data => {
      // 找到并更新对应的歌词
      const index = data.lyrics.findIndex(l => l.id === updatedLyric.id);
      if (index !== -1) {
        data.lyrics[index] = updatedLyric;
      }
      
      // 保存更新后的数据
      return fetch('lyrics.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    })
    .catch(error => console.error('更新歌词数据失败:', error));
}

function deleteLyric(id) {
  try {
    const confirmed = confirm('确定要删除这首歌词吗？');
    if(!confirmed) return;
    
    console.log('开始删除歌词，ID:', id);
    
    fetch('lyrics.json')
      .then(response => {
        console.log('获取歌词数据响应状态:', response.status);
        if(!response.ok) throw new Error(`获取歌词数据失败，状态码: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('原始歌词数据:', JSON.stringify(data));
        
        // 过滤掉要删除的歌词
        const originalLength = data.lyrics.length;
        data.lyrics = data.lyrics.filter(lyric => lyric.id !== id);
        
        if(originalLength === data.lyrics.length) {
          throw new Error('未找到要删除的歌词，ID: ' + id);
        }
        
        console.log('更新后的歌词数据:', JSON.stringify(data));
        
        // 保存更新后的数据
        return fetch('lyrics.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      })
      .then(response => {
        console.log('保存修改响应状态:', response.status, '响应内容:', response);
        if(!response.ok) throw new Error(`保存修改失败，状态码: ${response.status}`);
        
        // 确保数据已更新后再重新加载
        return fetch('lyrics.json');
      })
      .then(response => response.json())
      .then(updatedData => {
        console.log('验证更新后的数据:', JSON.stringify(updatedData));
        
        // 重新渲染页面
        document.getElementById('app').innerHTML = '';
        initApp();
        
        console.log('删除成功，页面已重新渲染');
      })
      .catch(error => {
        console.error('删除歌词过程中出错:', {
          error: error,
          message: error.message,
          stack: error.stack
        });
        alert(`删除歌词失败: ${error.message}\n请查看控制台获取详细错误信息`);
      });
  } catch (error) {
    console.error('确认对话框错误:', {
      error: error,
      message: error.message,
      stack: error.stack
    });
    alert('无法显示确认对话框，请检查浏览器设置或禁用弹出窗口阻止程序');
  }
}

function createLyricCard(lyric) {
  const card = document.createElement('div');
  card.className = 'bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer min-h-64 overflow-hidden';
  
  const title = document.createElement('h3');
  title.className = 'text-xl font-bold mb-2';
  title.textContent = lyric.title;
  
  const artist = document.createElement('p');
  artist.className = 'text-gray-400 mb-4';
  artist.textContent = lyric.artist;
  
  const content = document.createElement('p');
  content.className = 'text-gray-300 line-clamp-4 cursor-pointer transition-all mb-4';
  content.textContent = lyric.content;
  
  const tags = document.createElement('div');
  tags.className = 'flex flex-wrap gap-2 mb-4';
  
  const tagInput = document.createElement('input');
  tagInput.type = 'text';
  tagInput.className = 'px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm w-full';
  tagInput.value = lyric.tags.join(',');
  tagInput.placeholder = '输入标签，用逗号分隔';
  
  tagInput.addEventListener('blur', () => {
    const newTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
    lyric.tags = newTags;
    updateLyricsData(lyric);
  });
  
  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      tagInput.blur();
    }
  });
  
  tags.appendChild(tagInput);
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'flex items-center gap-2 text-blue-400 hover:text-blue-300';
  copyBtn.innerHTML = '<i class="far fa-copy"></i> 复制歌词';
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lyric.content);
  });
  
  const editBtn = document.createElement('button');
  editBtn.className = 'flex items-center gap-2 text-green-400 hover:text-green-300 ml-4';
  editBtn.innerHTML = '<i class="far fa-edit"></i> 编辑';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showEditModal(lyric);
  });
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'flex items-center gap-2 text-red-400 hover:text-red-300 ml-4 hidden';
  deleteBtn.innerHTML = '<i class="far fa-trash-alt"></i> 删除';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteLyric(lyric.id);
  });
  
  const moreBtn = document.createElement('button');
  moreBtn.className = 'text-blue-400 hover:text-blue-300 text-sm mb-4';
  moreBtn.textContent = '更多';
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    content.classList.toggle('line-clamp-4');
    moreBtn.textContent = content.classList.contains('line-clamp-4') ? '更多' : '收起';
  });
  
  const btnContainer = document.createElement('div');
  btnContainer.className = 'flex';
  btnContainer.appendChild(copyBtn);
  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(deleteBtn);
  
  card.addEventListener('click', () => {
    deleteBtn.classList.toggle('hidden');
  });
  
  card.appendChild(title);
  card.appendChild(artist);
  card.appendChild(content);
  card.appendChild(tags);
  card.appendChild(moreBtn);
  card.appendChild(btnContainer);
  
  return card;
}

// 创建新歌词卡片
function createNewLyricCard() {
  const newLyric = {
    id: Date.now(),
    title: '新歌词',
    artist: '未知歌手',
    content: '请输入歌词内容...',
    tags: []
  };
  
  // 添加到歌词数据
  fetch('lyrics.json')
    .then(response => response.json())
    .then(data => {
      data.lyrics.push(newLyric);
      return fetch('lyrics.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    })
    .then(() => {
      // 显示编辑模态框
      showEditModal(newLyric);
      
      // 重新渲染卡片
      document.getElementById('app').innerHTML = '';
      initApp();
    })
    .catch(error => {
      console.error('添加新歌词失败:', error);
      alert('添加新歌词失败，请查看控制台获取详情');
    });
}

// 初始化应用
async function initApp() {
  const lyrics = await loadLyrics();
  
  // 只渲染前5个歌词卡片
  lyrics.slice(0, 5).forEach(lyric => {
    app.appendChild(createLyricCard(lyric));
  });
}

// 启动应用
initApp();