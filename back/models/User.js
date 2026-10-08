import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false, // never return password by default on queries
        },
        phone: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            trim: true,
            default: '',
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'customer'],
            default: 'customer',
        },
        addresses: [
            {
                label: { type: String, default: 'Home' },
                street: String,
                city: String,
                postalCode: String,
                country: { type: String, default: 'Morocco' },
            },
        ],
    },
    { timestamps: true }
)

// Hash the password before saving, but only if it changed.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Instance method used by the login controller to check a plaintext password.
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User