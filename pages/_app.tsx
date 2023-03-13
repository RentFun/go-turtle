import '@/styles/globals.scss'
import styles from '@/styles/Home.module.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
