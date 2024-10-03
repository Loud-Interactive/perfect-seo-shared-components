import TypeWriterText from "@/perfect-seo-shared-components/components/TypeWriterText/TypeWriterText";
import style from './Hero.module.scss'
import en from '@/assets/en.json'

const Hero = () => {
  const data = en.home.hero


  return (
    <section className={style.heroSection} id="hero-section">
      <div className="container">
        {/* <div className="row">
          <div className="col-lg-6 col-md-12 mx-auto"> */}
        <div className="hero-content">
          <h1 className="hero-title mb-0">
            <TypeWriterText string={data.header} withBlink />
          </h1>
          <p className="hero-text mb-0">
            {data.subheader}
          </p>
          {/* </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}

export default Hero;