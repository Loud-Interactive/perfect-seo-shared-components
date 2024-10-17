import TypeWriterText from "@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText"
import styles from './Loader.module.scss'

interface LoaderProps {
  string?: string;
}
const Loader = ({ string }: LoaderProps) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.loader}>
        <div className="lilbot robot1"></div>
        <div className={styles.loadingMessage}>
          <TypeWriterText string={string || "loading"} withBlink />
        </div>
      </div>
    </div>
  )
}

export default Loader