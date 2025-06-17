// src/components/ModalPremio.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Share2 } from 'lucide-react'

interface ModalPremioProps {
    resultado: {
        prize: {
            type: 'discount' | 'gift' | 'product'
            value: string | number
        },
        code: string
    } | null
    onClose: () => void
}

export function ModalPremio({ resultado, onClose }: ModalPremioProps) {
    if (!resultado) return null

    const textoPremio =
        resultado.prize.type === 'discount'
            ? `${resultado.prize.value}% de descuento`
            : resultado.prize.value

    const textoWhatsApp = encodeURIComponent(`¡He ganado ${textoPremio} en la ruleta de Lucel! Usa mi código: ${resultado.code}`)

    return (
        <AnimatePresence>
            <motion.div
                className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className='bg-white rounded-2xl p-6 max-w-md w-full shadow-lg relative text-center'
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <h2 className='text-2xl font-bold mb-4'>🎉 ¡Premio conseguido!</h2>
                    <p className='text-lg'>Has ganado:</p>
                    <p className='text-xl font-semibold my-2'>{textoPremio}</p>
                    <div className='bg-gray-100 rounded p-2 mt-2 flex items-center justify-between'>
                        <code className='text-md font-mono'>{resultado.code}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(resultado.code)}
                            className='p-1 hover:text-blue-600'
                            title='Copiar código'
                        >
                            <Copy size={18} />
                        </button>
                    </div>

                    <a
                        href={`https://wa.me/?text=${textoWhatsApp}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-4 inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition'
                    >
                        <Share2 size={16} />
                        Compartir por WhatsApp
                    </a>

                    <button
                        onClick={onClose}
                        className='absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold'
                    >
                        ×
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
