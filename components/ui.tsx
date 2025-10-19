import React from 'react';
import { createPortal } from 'react-dom';
import { monsterBlockTypes } from '../constants';

export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-lime-600 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="mt-4 text-lg">{text}</p>
  </div>
);

export interface BlockIconProps {
    block: string;
    size?: string;
    count?: number;
    className?: string;
    images: { [key: string]: string };
}

const generateColorStyles = () => {
    const colors = {
        Red: 'bg-red-500', Orange: 'bg-orange-500', Yellow: 'bg-yellow-400',
        Green: 'bg-green-500', Blue: 'bg-blue-500', Purple: 'bg-purple-500',
        Pink: 'bg-pink-400', Brown: 'bg-[#A0522D]', Black: 'bg-gray-900',
        White: 'bg-white', Gray: 'bg-gray-500', Cyan: 'bg-cyan-500',
    };
    const shapes = ['Block', 'Slab', 'SmallBlock'];
    const styles = {};
    for (const colorName in colors) {
        for (const shape of shapes) {
            styles[`${colorName}${shape}`] = colors[colorName];
        }
    }
    return styles;
};

export const BlockIcon: React.FC<BlockIconProps> = ({ block, size = 'h-6 w-6', count, className = '', images }) => {
    const blockStyle: { [key: string]: string } = {
        'Dirt': 'bg-[#966C4A]',
        'Stone': 'bg-gray-500',
        'WoodPlank': 'bg-transparent',
        'Diamond': 'bg-sky-400 shadow-lg shadow-sky-700/50',
        'WoodTrunk': 'bg-[#6B4F35]',
        'Leaves': 'bg-green-600',
        'Water': 'bg-blue-500/70',
        'Wool': 'bg-gray-200',
        'Sand': 'bg-transparent',
        'Gravel': 'bg-gray-400',
        'Apple': 'bg-transparent',
        'Grass': 'bg-transparent',
        'Man': 'bg-transparent',
        'Woman': 'bg-transparent',
        'Baby': 'bg-transparent',
        'Cow': 'bg-transparent',
        'Pig': 'bg-transparent',
        'Chicken': 'bg-transparent',
        'Dog': 'bg-transparent',
        'Cat': 'bg-transparent',
        'Bird': 'bg-transparent',
        'Fish': 'bg-transparent',
        'Insect': 'bg-transparent',
        'Elephant': 'bg-transparent',
        'Iron': 'bg-transparent',
        'Marble': 'bg-transparent',
        'Copper': 'bg-transparent',
        'Gold': 'bg-transparent',
        'Silver': 'bg-transparent',
        'Window': 'bg-cyan-200',
        'Door': 'bg-[#A0522D]',
        'Shingles': 'bg-slate-700',
        'Table': 'bg-[#D2B48C]',
        'Chair': 'bg-[#CD853F]',
        // Monsters
        'Slime': 'bg-transparent',
        'Bat': 'bg-transparent',
        'Spider': 'bg-transparent',
        'Ghost': 'bg-transparent',
        'Zombie': 'bg-transparent',
        'Skeleton': 'bg-transparent',
        'Ogre': 'bg-transparent',
        'Golem': 'bg-transparent',
        'Dragon': 'bg-transparent',
        ...generateColorStyles(),
    };

    const imageUrl = images[block];
    // Use 'contain' for people and monsters to prevent stretching
    const imageClassName = (block === 'Man' || block === 'Woman' || monsterBlockTypes.includes(block))
        ? "w-full h-full object-contain"
        : "w-full h-full object-cover";

    // List of blocks with small assets that should be scaled up for visibility.
    const undersizedBlocks = ['Apple', 'Bird', 'Fish', 'Insect', 'Chicken'];
    const needsScaling = undersizedBlocks.includes(block);
    // Apply a scaling transform if the block is undersized.
    const scalingClass = needsScaling ? 'transform scale-200' : '';

    let finalBlockStyle = blockStyle[block] || 'bg-gray-300';
    const isInventoryIcon = count !== undefined;
    if ((block === 'Bat' || block === 'Spider') && isInventoryIcon) {
        finalBlockStyle = 'bg-sky-400';
    }


    return (
        <div title={block} className={`relative ${size} shadow-md transition-all ${finalBlockStyle} ${className} overflow-hidden`}>
             {imageUrl && <img src={imageUrl} alt={block} className={`${imageClassName} ${scalingClass}`} style={{ imageRendering: 'pixelated' }} />}
            {count !== undefined && (
                <span className="absolute bottom-0 right-0 text-xs font-bold text-white bg-black bg-opacity-50 px-1">
                    {count}
                </span>
            )}
        </div>
    );
};

export const Modal = ({ isOpen, onClose, title, children = null, maxWidth = 'max-w-xl' }) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className={`bg-white rounded-xl shadow-2xl p-6 w-full ${maxWidth} transform transition-all scale-100 duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition-colors text-3xl leading-none font-light"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
};