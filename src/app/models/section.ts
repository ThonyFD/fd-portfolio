export interface Section {
  description: string
  end?: string
  hasHeading: boolean
  icon: string
  isHead: boolean
  label: string
  locale: any
  logo: string
  order: number
  start: string
  slots: Array<Section>
  showDescription?: boolean
  subTitle: string
  title: string
  visible: boolean
}
