import React, { useEffect, useState } from 'react'
import { Wheel } from 'react-custom-roulette'

export type Prize = {
    type: 'discount' | 'gift' | 'product'
    value: string | number
}

type SpinRouletteProps = {
    prizes: Prize[]
    onSpinComplete: (prize: Prize) => void
    disabled?: boolean
    mustSpin: boolean
    prizeIndex: number | null
}

const mapPrizeToOption = (prize: Prize) => {
    return prize.type === 'discount'
        ? `${prize.value}% Descuento`
        : prize.value.toString()
}

export function SpinRoulette({
    prizes,
    onSpinComplete,
    disabled = false,
    mustSpin,
    prizeIndex,
}: SpinRouletteProps) {
    const data = prizes.map(p => ({ option: mapPrizeToOption(p) }))
    const [isSpinning, setIsSpinning] = useState(false)

    useEffect(() => {
        if (mustSpin && prizeIndex !== null && !isSpinning) {
            setIsSpinning(true)
        }
    }, [mustSpin, prizeIndex, isSpinning])

    function handleStop() {
        setIsSpinning(false)
        if (prizeIndex !== null) {
            onSpinComplete(prizes[prizeIndex])
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <Wheel
                mustStartSpinning={isSpinning}
                prizeNumber={prizeIndex ?? 0}
                data={data}
                onStopSpinning={handleStop}
                backgroundColors={['#3b82f6', '#2563eb']}
                textColors={['#fff']}
            />
        </div>
    )
}
