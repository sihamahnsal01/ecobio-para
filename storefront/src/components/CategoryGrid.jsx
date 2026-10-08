import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import '../assets/styles/categoryGrid.css'

const categoryPresentation = {
    'health & wellness': { description: 'Sleep aids, immunity boosters', icon: 'fa-regular fa-heart', image: '/categoriesIMG/health-wellness.jpg' },
    'beauty & skincare': { description: 'Serums, creams & sunscreens', icon: 'fa-solid fa-wand-magic-sparkles', image: '/categoriesIMG/beauty-skincare.jpg' },
    'vitamins & supplements': { description: 'Vitamins, minerals & omega-3', icon: 'fa-solid fa-flask', image: '/categoriesIMG/vitamins.jpg' },
    'baby care': { description: 'Gentle products for little ones', icon: 'fa-regular fa-star', image: '/categoriesIMG/baby-care.jpg' },
    'herbal & natural': { description: 'Teas, oils & plant extracts', icon: 'fa-solid fa-leaf', image: '/categoriesIMG/herbal-natural.jpg' },
    'personal care': { description: 'Hair, body & dental care', icon: 'fa-regular fa-user', image: '/categoriesIMG/personal-care.jpg' },
}

function CategoryGrid() {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        let cancelled = false

        const loadCategories = async () => {
            try {
                const data = await api.get('/categories')
                if (!cancelled) setCategories(Array.isArray(data) ? data : [])
            } catch {
                if (!cancelled) setCategories([])
            }
        }

        loadCategories()
        return () => { cancelled = true }
    }, [])

    return (
        <section className="category-section">
            <div className="category-header block={true}">
                <div>
                    <span className="category-eyebrow">Browse by category</span>
                    <h2>Everything for your wellbeing</h2>
                </div>
                <Link to="/products" className="view-all">
                    View all products <i className="fa-solid fa-arrow-right"></i>
                </Link>
            </div>

            <div className="category-grid block={true}">
                {categories.map((cat) => {
                    const presentation = categoryPresentation[cat.name.toLowerCase()] || {
                        description: 'Browse products in this category',
                        icon: 'fa-solid fa-pills',
                        image: '/categoriesIMG/health-wellness.jpg',
                    }

                    return (
                    <Link
                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="category-card"
                        key={cat._id || cat.name}
                    >
                        <div className="category-image-wrap">
                            <img src={presentation.image} alt={cat.name} />
                            <span className="category-count">{cat.productCount} items</span>
                        </div>
                        <div className="category-info">
                            <span className="category-icon">
                                <i className={presentation.icon}></i>
                            </span>
                            <div>
                                <h3>{cat.name}</h3>
                                <p>{presentation.description}</p>
                            </div>
                        </div>
                    </Link>
                    )
                })}
            </div>
        </section>
    )
}

export default CategoryGrid