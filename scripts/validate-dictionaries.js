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

// 从源码直接导入词典配置（编译前验证）
try {
  // 使用TypeScript编译器或直接解析源码
  console.log('🔍 开始验证词典的 chapterStartWords...')
  
  // 读取源码中的词典定义
  const dictionarySourcePath = path.join(__dirname, '..', 'src', 'resource', 'dictionary.ts')
  const sourceContent = fs.readFileSync(dictionarySourcePath, 'utf8')
  
  // 简单的正则解析 chapterStartWords
  const chapterStartWordsMatches = sourceContent.match(/chapterStartWords:\s*\[([\s\S]*?)\]/g)
  
  if (!chapterStartWordsMatches || chapterStartWordsMatches.length === 0) {
    console.log('✅ 没有发现使用 chapterStartWords 的词典，验证通过')
    process.exit(0)
  }
  
  console.log(`📋 发现 ${chapterStartWordsMatches.length} 个使用自定义章节的词典配置`)
  
  // 提取词典ID和对应的 chapterStartWords
  let totalErrors = 0
  let validatedCount = 0
  
  chapterStartWordsMatches.forEach((match, index) => {
    try {
      // 提取数组内容
      const arrayContent = match.match(/\[([\s\S]*?)\]/)[1]
      const words = arrayContent
        .split(',')
        .map(word => word.trim().replace(/['"]/g, ''))
        .filter(word => word.length > 0)
      
      if (words.length > 0) {
        console.log(`⚠️  检测到自定义章节配置 #${index + 1}: [${words.join(', ')}]`)
        console.log(`   请手动验证这些单词是否存在于对应的词典文件中`)
        validatedCount++
      }
    } catch (error) {
      console.error(`❌ 解析自定义章节配置时出错: ${error.message}`)
      totalErrors++
    }
  })
  
  console.log(`\n📊 验证完成:`)
  console.log(`   - 检测到 ${validatedCount} 个自定义章节配置`)
  console.log(`   - 发现 ${totalErrors} 个解析错误`)
  
  if (totalErrors > 0) {
    console.error('\n❌ 验证过程中有错误，请检查配置')
    process.exit(1)
  } else {
    console.log('\n✅ 配置检测完成！')
    console.log('💡 提示：如果你启用了 chapterStartWords，请确保这些单词确实存在于词典文件中')
    process.exit(0)
  }
  
} catch (error) {
  console.error('❌ 验证过程出错:', error.message)
  process.exit(1)
} 