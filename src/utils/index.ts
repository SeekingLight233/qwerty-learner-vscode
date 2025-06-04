import * as vscode from 'vscode'
import path from 'path'
import fs from 'fs'
import { DictionaryResource, Word } from '@/typings'

/**
 * 错误返回错误索引，正确返回-2，未完成输入且无错误返回-1
 */
export function compareWord(word: string, input: string) {
  for (let i = 0; i < word.length; i++) {
    if (typeof input[i] !== 'undefined') {
      if (word[i] !== input[i]) {
        return i
      }
    } else {
      return -1
    }
  }
  return -2
}

export function getConfig(key: string) {
  return vscode.workspace.getConfiguration('qwerty-learner')[key]
}

export function getDictFile(dictPath: string) {
  const filePath = path.join(__dirname, '..', 'assets/dicts', dictPath)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

/**
 * 验证词典的chapterStartWords字段中的单词是否都存在于词典文件中
 */
export function validateChapterStartWords(dict: DictionaryResource): string[] {
  if (!dict.chapterStartWords || dict.chapterStartWords.length === 0) {
    return []
  }

  // 错题本词典不需要验证
  if (dict.id === 'wrong-book') {
    return []
  }

  const errors: string[] = []
  
  try {
    const dictWords: Word[] = getDictFile(dict.url)
    const wordNames = new Set(dictWords.map(word => word.name))
    
    dict.chapterStartWords.forEach((startWord, index) => {
      if (!wordNames.has(startWord)) {
        errors.push(`词典 "${dict.name}" 第 ${index + 1} 章的首个单词 "${startWord}" 在词典文件中不存在`)
      }
    })
  } catch (error) {
    errors.push(`无法加载词典文件: ${dict.url} - ${error}`)
  }
  
  return errors
}

/**
 * 根据chapterStartWords切割单词列表为章节
 */
export function getChapterWordsByStartWords(words: Word[], chapterStartWords: string[], chapterIndex: number): Word[] {
  if (!chapterStartWords || chapterStartWords.length === 0) {
    return []
  }

  if (chapterIndex >= chapterStartWords.length) {
    return []
  }

  const startWord = chapterStartWords[chapterIndex]
  const nextStartWord = chapterIndex + 1 < chapterStartWords.length ? chapterStartWords[chapterIndex + 1] : null
  
  const startIndex = words.findIndex(word => word.name === startWord)
  if (startIndex === -1) {
    return []
  }

  const endIndex = nextStartWord ? words.findIndex(word => word.name === nextStartWord) : words.length
  
  return words.slice(startIndex, endIndex === -1 ? words.length : endIndex)
}
