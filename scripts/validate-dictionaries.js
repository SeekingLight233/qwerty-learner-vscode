const fs = require('fs')
const path = require('path')

// 模拟词典资源类型和验证函数
function getDictFile(dictPath) {
  const filePath = path.join(__dirname, '..', 'assets/dicts', dictPath)
  if (!fs.existsSync(filePath)) {
    throw new Error(`词典文件不存在: ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function validateChapterStartWords(dict) {
  if (!dict.chapterStartWords || dict.chapterStartWords.length === 0) {
    return []
  }

  // 错题本词典不需要验证
  if (dict.id === 'wrong-book') {
    return []
  }

  const errors = []
  
  try {
    const dictWords = getDictFile(dict.url)
    const wordNames = new Set(dictWords.map(word => word.name))
    
    dict.chapterStartWords.forEach((startWord, index) => {
      if (!wordNames.has(startWord)) {
        errors.push(`词典 "${dict.name}" 第 ${index + 1} 章的首个单词 "${startWord}" 在词典文件中不存在`)
      }
    })
  } catch (error) {
    errors.push(`无法加载词典文件: ${dict.url} - ${error.message}`)
  }
  
  return errors
}

// 解析TypeScript源码中的词典配置
function parseDictionarySource(sourceContent) {
  const dictionaries = []
  
  // 匹配词典对象的正则表达式
  const dictRegex = /{\s*id:\s*['"`]([^'"`]+)['"`][\s\S]*?}/g
  
  let match
  while ((match = dictRegex.exec(sourceContent)) !== null) {
    const dictMatch = match[0]
    const dictId = match[1]
    
    // 提取词典的各个属性
    const nameMatch = dictMatch.match(/name:\s*['"`]([^'"`]+)['"`]/)
    const urlMatch = dictMatch.match(/url:\s*['"`]([^'"`]+)['"`]/)
    const chapterStartWordsMatch = dictMatch.match(/chapterStartWords:\s*\[([\s\S]*?)\]/)
    
    if (nameMatch && urlMatch) {
      const dict = {
        id: dictId,
        name: nameMatch[1],
        url: urlMatch[1],
        chapterStartWords: null
      }
      
      if (chapterStartWordsMatch) {
        const arrayContent = chapterStartWordsMatch[1]
        const words = arrayContent
          .split(',')
          .map(word => word.trim().replace(/['"]/g, ''))
          .filter(word => word.length > 0)
        
        dict.chapterStartWords = words
      }
      
      dictionaries.push(dict)
    }
  }
  
  return dictionaries
}

// 主验证逻辑
try {
  console.log('🔍 开始验证词典的 chapterStartWords...')
  
  // 读取源码中的词典定义
  const dictionarySourcePath = path.join(__dirname, '..', 'src', 'resource', 'dictionary.ts')
  const sourceContent = fs.readFileSync(dictionarySourcePath, 'utf8')
  
  // 解析词典配置
  const dictionaries = parseDictionarySource(sourceContent)
  const dictionariesWithChapters = dictionaries.filter(dict => dict.chapterStartWords && dict.chapterStartWords.length > 0)
  
  if (dictionariesWithChapters.length === 0) {
    console.log('✅ 没有发现使用 chapterStartWords 的词典，验证通过')
    process.exit(0)
  }
  
  console.log(`📋 发现 ${dictionariesWithChapters.length} 个使用自定义章节的词典配置`)
  
  let totalErrors = 0
  
  for (const dict of dictionariesWithChapters) {
    console.log(`\n🔍 验证词典: ${dict.name} (${dict.id})`)
    console.log(`   📝 自定义章节数: ${dict.chapterStartWords.length}`)
    console.log(`   📄 词典文件: ${dict.url}`)
    console.log(`   📚 章节首词: [${dict.chapterStartWords.join(', ')}]`)
    
    const errors = validateChapterStartWords(dict)
    
    if (errors.length > 0) {
      console.error(`   ❌ 验证失败:`)
      errors.forEach(error => console.error(`      ${error}`))
      totalErrors += errors.length
    } else {
      console.log(`   ✅ 验证通过！所有章节首词都存在于词典文件中`)
    }
  }
  
  console.log(`\n📊 验证完成:`)
  console.log(`   - 验证了 ${dictionariesWithChapters.length} 个具有自定义章节的词典`)
  console.log(`   - 发现 ${totalErrors} 个错误`)
  
  if (totalErrors > 0) {
    console.error('\n❌ 验证失败，请修复上述错误后重新编译')
    process.exit(1)
  } else {
    console.log('\n✅ 所有词典验证通过！🎉')
    process.exit(0)
  }
  
} catch (error) {
  console.error('❌ 验证过程出错:', error.message)
  console.error(error.stack)
  process.exit(1)
} 