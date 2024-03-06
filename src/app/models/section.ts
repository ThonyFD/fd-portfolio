export interface Section {
  color: string
  description: string
  end?: string
  fit?: string
  hasHeading: boolean
  icon: string
  isHead: boolean
  label: string
  locale: any
  logo: string
  order: number
  orientation: string
  sizeLg: number
  start: string
  slots: Array<Section>
  showDescription?: boolean
  subTitle: string
  title: string
  visible: boolean
}
