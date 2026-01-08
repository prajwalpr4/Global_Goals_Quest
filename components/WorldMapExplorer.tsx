'use client'

import React from 'react'
import { WorldMap } from 'react-svg-worldmap'
import { motion } from 'framer-motion'

interface WorldMapExplorerProps {
    completedCountryCodes: string[]
    onCountryClick: (countryCode: string) => void
    selectedCountry: string | null
}

export function WorldMapExplorer({ completedCountryCodes, onCountryClick, selectedCountry }: WorldMapExplorerProps) {

    // Process data for the map
    // The library expects an array of { country: string, value: number }
    // We can use 'value' to encode status (e.g., 1 = nothing, 2 = completed) 
    // but the styling is done via a callback based on country code mostly.

    // However, the library requires data to render anything.
    // Let's create a dataset that includes all countries we care about + some defaults.
    // For simplicity, we can just pass a dummy dataset or a full list of ISO codes if we want all to be interactive.
    // But styling happens in styleFunction.

    const data = [
        { country: "br", value: 1 }, // Brazil
        { country: "jp", value: 1 }, // Japan
        { country: "in", value: 1 }, // India
        { country: "us", value: 1 }, // USA
        { country: "cn", value: 1 }, // China
        { country: "au", value: 1 }, // Australia
        { country: "gb", value: 1 }, // UK
        { country: "de", value: 1 }, // Germany
        { country: "fr", value: 1 }, // France
        { country: "za", value: 1 }, // South Africa
        // Add more as needed or fetch dynamically if possible, but static list is fine for "Explorable" world
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getStyle = (props: any) => {
        const countryCode = props.countryCode

        const isCompleted = completedCountryCodes.includes(countryCode.toUpperCase())
        const isSelected = selectedCountry?.toUpperCase() === countryCode.toUpperCase()

        if (isSelected) {
            return {
                fill: "#3b82f6", // Blue-500 (Selected)
                fillOpacity: 1,
                stroke: "white",
                strokeWidth: 2,
                strokeOpacity: 0.5,
                cursor: "pointer",
            }
        }

        if (isCompleted) {
            return {
                fill: "#4ade80", // Green-400 (Completed)
                fillOpacity: 1,
                stroke: "white",
                strokeWidth: 1,
                strokeOpacity: 0.2,
                cursor: "pointer",
            }
        }

        return {
            fill: "#cbd5e1", // Slate-300 (Default)
            fillOpacity: 0.3,
            stroke: "white",
            strokeWidth: 1,
            strokeOpacity: 0.1,
            cursor: "pointer",
        }
    }

    return (
        <div className="w-full bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm shadow-xl flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌍</span> Global Explorer
            </h3>
            <p className="text-sm text-slate-400 mb-6 text-center">
                Click a country to find quests. <span className="text-green-400 font-bold">Green</span> countries are fully explored!
            </p>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex justify-center overview-hidden"
            >
                <WorldMap
                    color="cyan" // Default fallback
                    backgroundColor="transparent"
                    borderColor="white"
                    value-suffix="quests"
                    size="responsive"
                    data={data}
                    styleFunction={getStyle}
                    onClickFunction={(props: any) => {
                        // Library passes specific object structure on click
                        // props: { event, countryCode, countryValue, countryName }
                        onCountryClick(props.countryCode.toUpperCase())
                    }}
                />
            </motion.div>
        </div>
    )
}
