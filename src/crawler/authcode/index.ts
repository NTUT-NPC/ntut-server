import * as fs from 'fs'
import { PNG } from 'pngjs'

import getAlphabetBySection from './alphabetTable'

/* tslint:disable no-bitwise */
interface IAlphabetLocation {
  xStart: number,
  xStop: number,
  yStart: number,
  yStop: number
}

const savePNG = (pngData: PNG): void => {
  fs.writeFileSync('code.png', PNG.sync.write(pngData))
}

const getDefaultAlphabetLocation = (): IAlphabetLocation => {
  return { xStart: -1, xStop: -1, yStart: -1, yStop: -1 } as IAlphabetLocation
}

const getAlpabetsFromPNG = (pngData: PNG): string => {
  const alphabetsLocations: IAlphabetLocation[] = []
  alphabetsLocations.length = 4
  for (let i = 0; i < alphabetsLocations.length; i++) {
    alphabetsLocations[i] = getDefaultAlphabetLocation()
  }
  findAlpabetsLocationsXFromPNG(pngData, alphabetsLocations)
  findAlpabetsLocationsYFromPNG(pngData, alphabetsLocations)
  const alphabetsSections: string[] = stringifyAlphabetsSections(pngData, alphabetsLocations)
  return convertAlphabetsSectionsToAlphabets(alphabetsSections)
}

const findAlpabetsLocationsXFromPNG = (pngData: PNG, alphabetsLocations: IAlphabetLocation[]): void => {
  let index: number = 0
  let xStart: number = -1
  let xStop: number = -1
  for (let x: number = 0; x < pngData.width; x++) {
    let isBackground: boolean = true
    for (let y: number = 0; y < pngData.height; y++) {
      const idx: number = (pngData.width * y + x) << 2
      const isWhite: boolean = (pngData.data[idx] + pngData.data[idx + 1] + pngData.data[idx + 2]) === 765
      if (isWhite) {
        isBackground = false
        break
      }
    }
    xStart = (xStart === -1 && xStop === -1 && !isBackground) ? x : xStart
    xStop = (xStart !== -1 && xStop === -1 && isBackground) ? x - 1 : xStop
    if (xStart !== -1 && xStop !== -1) {
      alphabetsLocations[index].xStart = xStart
      alphabetsLocations[index].xStop = xStop
      xStart = -1
      xStop = -1
      index += 1
    }
  }
}

const findAlpabetsLocationsYFromPNG = (pngData: PNG, alphabetsLocations: IAlphabetLocation[]): void => {
  for (const location of alphabetsLocations) {
    location.yStart = -1
    location.yStop = -1
    for (let x: number = location.xStart; x <= location.xStop; x++) {
      let tempStart: number = -1
      let tempStop: number = -1
      for (let y: number = 0; y < pngData.height; y++) {
        const top: number = y
        const bottom: number = pngData.height - y - 1
        if (tempStart === -1) {
          const idx: number = (pngData.width * top + x) << 2
          const isWhite: boolean = (pngData.data[idx] + pngData.data[idx + 1] + pngData.data[idx + 2]) === 765
          tempStart = isWhite ? top : -1
        }
        if (tempStop === -1) {
          const idx: number = (pngData.width * bottom + x) << 2
          const isWhite: boolean = (pngData.data[idx] + pngData.data[idx + 1] + pngData.data[idx + 2]) === 765
          tempStop = isWhite ? bottom : -1
        }
        if (tempStart !== -1 && tempStop !== -1) {
          break
        }
      }
      location.yStart = location.yStart === -1 ? tempStart : Math.min(location.yStart, tempStart)
      location.yStop = location.yStop === -1 ? tempStop : Math.max(location.yStop, tempStop)
    }
  }
}

const stringifyAlphabetsSections = (pngData: PNG, alphabetsLocations: IAlphabetLocation[]): string[] => {
  const alphabetsSections: string[] = ['', '', '', '']
  for (let i = 0; i < alphabetsLocations.length; i++) {
    for (let y: number = alphabetsLocations[i].yStart; y <= alphabetsLocations[i].yStop; y++) {
      for (let x: number = alphabetsLocations[i].xStart; x <= alphabetsLocations[i].xStop; x++) {
        const idx: number = (pngData.width * y + x) << 2
        const isWhite: boolean = (pngData.data[idx] + pngData.data[idx + 1] + pngData.data[idx + 2]) === 765
        alphabetsSections[i] += isWhite ? '1' : '0'
      }
    }
  }
  return alphabetsSections
}

const convertAlphabetsSectionsToAlphabets = (alphabetsSections: string[]): string => {
  let alphabets: string = ''
  for (const section of alphabetsSections) {
    alphabets += getAlphabetBySection(section)
  }
  return alphabets
}

const getAuthCode = (buffer: Buffer): string => {
  const pngData: PNG = PNG.sync.read(buffer)
  const code: string = getAlpabetsFromPNG(pngData)
  // savePNG(pngData)
  return code
}
/* tslint:enable no-bitwise */

export default getAuthCode
