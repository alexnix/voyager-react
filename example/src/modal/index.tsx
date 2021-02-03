import React, {
  useState,
  Dispatch,
  SetStateAction,
  useContext,
  CSSProperties
} from 'react'
import Modal from 'react-modal'

type Dict<T> = {
  [key: string]: T
}

interface ModalConfig {
  open: boolean
  component: React.ReactNode | null
  style?: string | StyleOptions
}

interface ModalContext {
  config: Dict<ModalConfig>
  setConfig: Dispatch<SetStateAction<Dict<ModalConfig>>> | null
}

interface StyleOptions {
  content?: CSSProperties
  overlay?: CSSProperties
}

interface OpenOptions {
  style?: string | StyleOptions
  openIn?: string
  openInNew?: string
}

interface ModalProviderProps {
  styles?: Dict<StyleOptions>
}

const defaultConfigs: Dict<ModalConfig> = {
  default: { open: false, component: null }
}
const defaultContext: ModalContext = {
  config: defaultConfigs,
  setConfig: null
}

const ModalContex = React.createContext(defaultContext)

const ModalProvider: React.FC<ModalProviderProps> = ({ children, styles }) => {
  styles = {
    default: {
      content: {},
      overlay: {}
    },
    ...styles
  }

  const [config, setConfig] = useState<Dict<ModalConfig>>(defaultConfigs)

  const closeModal = (name: string) => () => {
    setConfig((prev) => ({ ...prev, [name]: { open: false, component: null } }))
  }

  const modals = []
  for (const [modalName, modalConfig] of Object.entries(config)) {
    let content, overlay
    if (typeof modalConfig.style === 'object') {
      ;({ content, overlay } = modalConfig.style)
    } else {
      ;({ content, overlay } = styles[modalConfig.style ?? 'default'])
    }

    modals.push(
      <div key={modalName}>
        <Modal
          isOpen={modalConfig.open}
          onRequestClose={closeModal(modalName)}
          style={{
            content,
            overlay
          }}
          ariaHideApp={false}
        >
          {modalConfig.component}
        </Modal>
      </div>
    )
  }

  return (
    <ModalContex.Provider value={{ config, setConfig }}>
      {modals}
      {children}
    </ModalContex.Provider>
  )
}

export const useOpen = () => {
  const { setConfig } = useContext(ModalContex)
  return (component: React.ReactNode, openOptions: OpenOptions = {}) =>
    setConfig!((prev) => ({
      ...prev,
      [openOptions.openIn ?? openOptions.openInNew ?? 'default']: {
        open: true,
        component,
        style: openOptions?.style
      }
    }))
}

export const useClose = () => {
  const { setConfig } = useContext(ModalContex)
  return (name: string = 'default') =>
    setConfig!((prev) => ({
      ...prev,
      [name]: { open: false, component: null }
    }))
}

export default ModalProvider
