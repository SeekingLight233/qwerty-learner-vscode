import { VoiceType } from './../../typings/index'
import { getConfig } from '../../utils'
interface NativeModule {
  playerPlay(voiceUrl: string, callback: () => void): void
}

let NATIVE: any = null

try {
  NATIVE = require(`node-loader!./rodio/mac-arm.node`) as NativeModule
} catch (error) {
  NATIVE = null
}

if (!(NATIVE && NATIVE.playerPlay)) {
  try {
    NATIVE = require(`node-loader!./rodio/win32.node`) as NativeModule
  } catch (error) {
    NATIVE = null
  }
}
if (!(NATIVE && NATIVE.playerPlay)) {
  try {
    NATIVE = require(`node-loader!./rodio/mac-intel.node`) as NativeModule
  } catch (error) {
    NATIVE = null
  }
}
if (!(NATIVE && NATIVE.playerPlay)) {
  try {
    NATIVE = require(`node-loader!./rodio/linux-x64.node`) as NativeModule
  } catch (error) {
    NATIVE = null
  }
}
if (!(NATIVE && NATIVE.playerPlay)) {
  NATIVE = null
}

// 生成Google翻译发音URL
const getGoogleVoiceUrl = (word: string): string => {
  const lang = getConfig('voiceType') === 'us' ? 'en-US' : 'en-GB'
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=${lang}&client=tw-ob`
}

// 生成有道发音URL
const getYoudaoVoiceUrl = (word: string): string => {
  const type = getConfig('voiceType') === 'us' ? 2 : 1
  return `https://dict.youdao.com/dictvoice?audio=${word}&type=${type}`
}

export const voicePlayer = (word: string, callback: () => void) => {
  if (NATIVE) {
    const googleUrl = getGoogleVoiceUrl(word)
    const youdaoUrl = getYoudaoVoiceUrl(word)
    
    let isCompleted = false
    let hasStartedPlaying = false
    let timeoutId: NodeJS.Timeout
    
    // 确保callback只调用一次
    const safeCallback = () => {
      if (!isCompleted) {
        isCompleted = true
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        callback()
      }
    }
    
    // 尝试有道作为fallback
    const fallbackToYoudao = () => {
      // 只有在Google还没开始播放且还没完成的情况下才fallback
      if (!hasStartedPlaying && !isCompleted) {
        console.log('Google翻译未能开始播放，使用有道词典')
        NATIVE.playerPlay(youdaoUrl, safeCallback)
      }
    }
    
    // 设置2秒超时
    timeoutId = setTimeout(() => {
      fallbackToYoudao()
    }, 2000)
    
    // 先尝试Google翻译
    try {
      NATIVE.playerPlay(googleUrl, safeCallback)
      // 如果调用成功（没有抛异常），认为播放已经开始
      hasStartedPlaying = true
    } catch (error) {
      // 如果调用失败，立即fallback到有道
      console.log('Google翻译播放失败，立即使用有道词典')
      clearTimeout(timeoutId)
      fallbackToYoudao()
    }
  } else {
    callback()
  }
}
