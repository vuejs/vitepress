import { page } from './vitestSetup'

export * from './vitestSetup'

export async function waitForLayout() {
  await page.waitForSelector('#app .Layout')
}
