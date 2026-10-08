import { Link } from "react-router-dom"
import ProductSlider from '../components/ProductSilder'
import CategoryGrid from '../components/CategoryGrid'
import BestSellers from "../components/BestSellers"
import PromoSection from "../components/PromoSection"
import storeDetails from '../data/storeDetails.json'
import useHeroPointer from '../utils/useHeroPointer.js'

function Home() {
    const heroRef = useHeroPointer()
    return (
        <div className="container">
             <div className="top-container" ref={heroRef}>
            <section className="topHome">
                <div className="hero-text">
                    <span className="badge">
                        <i className="fa-solid fa-circle badge-dot"></i>
                        Certified Maroccan {storeDetails.name}
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                    </span>

                    <h1>Your Health, <span className="highlight">Our Priority</span></h1>

                    <p className="subtext">
                        Browse 500+ certified health, beauty, and wellness products from trusted
                        European brands. Expert para-pharmacist advice, fast delivery to your door.
                    </p>

                    <div className="prd">
                        <span>
                            <p>500+</p>
                            <b>PRODUCTS</b>
                        </span>
                        <span>
                            <p>4.9 <i className="fa-solid fa-star"></i></p>
                            <b>RATING</b>
                        </span>
                        <span>
                            <p>24h</p>
                            <b>DELIVERY</b>
                        </span>
                    </div>

                    <div className="input">
                        <Link to="/products" className="btn-shop">
                            Shop Now
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                        <Link to="/contact" className="btn-advice">
                            <i className="fa-solid fa-phone"></i>
                            Expert Advice
                        </Link>
                    </div>
                </div>
            <ProductSlider />    
            </section>
            </div>
            <CategoryGrid />
            <BestSellers />
            <PromoSection />
        </div>
    )
}
export default Home