import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, BlockIcon, LoadingSpinner } from '../ui';

const AnswerFeedback = ({ isCorrect }) => {
    if (isCorrect === null) return null;
    const message = isCorrect ? 'Correct!' : 'Try Again!';
    const bgColor = isCorrect ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`absolute inset-0 z-20 flex items-center justify-center ${bgColor} bg-opacity-90 text-white text-4xl font-bold animate-fade-in`}>
            {message}
        </div>
    );
};

const ChallengeCompleteView = ({ rewards, onClose, onPlayAgain, obstacleName, loadedImages }) => (
    <div className="text-center p-4">
        <h2 className="text-3xl font-bold text-yellow-500 mb-4">Challenge Complete!</h2>
        <p className="text-gray-700 mb-4">You've earned these new blocks:</p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
            {Object.entries(rewards).map(([block, count]) => (
                 <BlockIcon key={block} block={block} count={count as number} size="h-16 w-16" images={loadedImages} />
            ))}
        </div>
        <div className="flex justify-center space-x-4">
            <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition">
                Back to Map
            </button>
            <button onClick={() => onPlayAgain(obstacleName)} className="px-6 py-2 bg-lime-600 text-white font-bold rounded-lg hover:bg-lime-700 transition">
                Play Again
            </button>
        </div>
    </div>
);

const InstructionView = ({ instruction, onAcknowledge }) => (
    <div className="absolute inset-0 bg-black bg-opacity-80 z-30 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">How to solve this type of problem:</h3>
            {instruction === 'Thinking...' ? (
                <LoadingSpinner text="Getting help..."/>
            ) : (
                <div className="text-gray-700 whitespace-pre-wrap">{instruction}</div>
            )}
            <button
                onClick={onAcknowledge}
                className="mt-6 w-full py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition"
            >
                Got it!
            </button>
        </div>
    </div>
);

const Numpad = ({ onInput, onDelete, allowDecimal = false }) => (
    <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto w-full">
        {'789456123'.split('').map(char => (
            <button key={char} type="button" onClick={() => onInput(char)} className="py-4 text-2xl font-bold bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm">
                {char}
            </button>
        ))}
        {allowDecimal ? (
            <>
                <button type="button" onClick={() => onInput('0')} className="py-4 text-2xl font-bold bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm">
                    0
                </button>
                <button type="button" onClick={() => onInput('.')} className="py-4 text-2xl font-bold bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm">
                    .
                </button>
            </>
        ) : (
             <button type="button" onClick={() => onInput('0')} className="py-4 text-2xl font-bold bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-sm col-span-2">
                0
            </button>
        )}
        <button type="button" onClick={onDelete} className="py-4 text-2xl font-bold bg-yellow-400 rounded-lg hover:bg-yellow-500 transition shadow-sm">
            ⌫
        </button>
    </div>
);

const InteractiveClockDisplay = ({ onTimeChange }) => {
    const clockRef = useRef<HTMLDivElement>(null);
    const [minuteAngle, setMinuteAngle] = useState(0);
    const [hourAngle, setHourAngle] = useState(0);
    const [selectedHand, setSelectedHand] = useState<'hour' | 'minute'>('minute'); // Default to minute hand
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const minutes = Math.round(minuteAngle / 6) % 60;
        let hourValue = Math.round(hourAngle / 30) % 12;
        const hours = hourValue === 0 ? 12 : hourValue;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : String(minutes);
        onTimeChange(`${hours}:${formattedMinutes}`);
    }, [minuteAngle, hourAngle, onTimeChange]);

    const updateHandPosition = (e: React.MouseEvent | React.TouchEvent) => {
        if (!clockRef.current) return;
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const angleRad = Math.atan2(clientY - rect.top - centerY, clientX - rect.left - centerX);
        let angleDeg = angleRad * (180 / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;

        if (selectedHand === 'minute') {
            const newMinuteAngle = Math.round(angleDeg / 6) * 6; // Snap to nearest minute
            setMinuteAngle(newMinuteAngle);
        } else if (selectedHand === 'hour') {
            const newHourAngle = Math.round(angleDeg / 7.5) * 7.5; // Snap to nearest quarter hour
            setHourAngle(newHourAngle);
        }
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        updateHandPosition(e);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        updateHandPosition(e);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setSelectedHand('hour')}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 transition ${selectedHand === 'hour' ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-gray-200 text-gray-800 border-gray-300'}`}
                >
                    Set Hour Hand
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedHand('minute')}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 transition ${selectedHand === 'minute' ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-gray-200 text-gray-800 border-gray-300'}`}
                >
                    Set Minute Hand
                </button>
            </div>
            <div
                ref={clockRef}
                className="relative w-64 h-64 bg-white rounded-full border-8 border-gray-700 shadow-lg mx-auto touch-none cursor-pointer"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onMouseUp={handleDragEnd}
                onTouchEnd={handleDragEnd}
                onMouseMove={handleDragMove}
                onTouchMove={handleDragMove}
                onMouseLeave={handleDragEnd}
            >
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="absolute w-full h-full flex justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                        <span className="absolute top-3 text-2xl font-bold text-gray-800" style={{ transform: `rotate(${-i * 30}deg)` }}>{i === 0 ? 12 : i}</span>
                    </div>
                ))}
                <div className="absolute top-1/2 left-1/2 w-2 h-20 bg-gray-900 rounded-t-full origin-bottom pointer-events-none z-[1]" style={{ transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)` }} />
                <div className="absolute top-1/2 left-1/2 w-1 h-28 bg-gray-900 rounded-t-full origin-bottom pointer-events-none z-[1]" style={{ transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)` }} />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-900 rounded-full border-2 border-white z-[2]" style={{ transform: 'translate(-50%, -50%)' }} />
            </div>
        </div>
    );
};


export const ChallengeModal = ({
    challengeState,
    onSubmitAnswer,
    onClose,
    getRewardPreviewText,
    loadedImages,
    onRequestInstruction,
    onAcknowledgeInstruction,
    currentGradeLevel
}) => {
    const { isOpen, obstacleName, problems, currentProblemIndex, isCorrect, rewards, isComplete, instruction, showInstruction } = challengeState;
    const [answer, setAnswer] = useState('');
    const [sortedItems, setSortedItems] = useState<(string | null)[]>([]);
    const [sourceItems, setSourceItems] = useState<string[]>([]);

    // State for unified touch/mouse drag and drop
    const [draggedItemInfo, setDraggedItemInfo] = useState(null); // { item, source, index }
    const dragOverTargetRef = useRef(null); // { targetSource, targetIndex }

    const currentProblem = problems[currentProblemIndex];

    useEffect(() => {
        setAnswer('');
        if (currentProblem?.type === 'sorting') {
            setSourceItems(currentProblem.data.items);
            setSortedItems(Array(currentProblem.data.items.length).fill(null));
        } else {
            setSourceItems([]);
            setSortedItems([]);
        }
    }, [currentProblemIndex, currentProblem]);

    // Speak the question for Kindergarten and Grade 1 levels
    useEffect(() => {
        if (isOpen && currentProblem && currentGradeLevel.id <= 2 && 'speechSynthesis' in window) {
            // Cancel any previous speech
            window.speechSynthesis.cancel();
            
            let textToSpeak = currentProblem.question;
            
            // Custom phrasing for number recognition
            if (currentProblem.type === 'number-recognition') {
                 textToSpeak = `What does the number ${currentProblem.data.word} look like?`;
            }

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }, [isOpen, currentProblem, currentGradeLevel]);


    const handleNumpadInput = (char) => {
        if (char === '.' && answer.includes('.')) {
            return; // Prevent multiple decimals
        }
        setAnswer(prev => prev + char);
    };

    const handleNumpadDelete = () => setAnswer(prev => prev.slice(0, -1));

    // --- Drag and Drop Logic for Sorting ---

    const performDrop = (draggedData, targetSource, targetIndex) => {
        const { item, source, index: sourceIndex } = draggedData;

        const newSourceItems = [...sourceItems];
        const newSortedItems = [...sortedItems];

        if (source === 'source' && targetSource === 'sorted') {
            const displacedItem = newSortedItems[targetIndex];
            newSortedItems[targetIndex] = item;
            
            const sourceItemIndex = newSourceItems.indexOf(item);
            if (displacedItem) {
                newSourceItems.splice(sourceItemIndex, 1, displacedItem);
            } else {
                newSourceItems.splice(sourceItemIndex, 1);
            }
        } else if (source === 'sorted' && targetSource === 'sorted') {
            const temp = newSortedItems[targetIndex];
            newSortedItems[targetIndex] = item;
            newSortedItems[sourceIndex] = temp;
        } else if (source === 'sorted' && targetSource === 'source') {
            newSortedItems[sourceIndex] = null;
            newSourceItems.push(item);
        }

        setSourceItems(newSourceItems);
        setSortedItems(newSortedItems);
    };

    // Mouse D&D handlers
    const handleMouseDragStart = (e, item, source, index) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ item, source, index }));
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleMouseDrop = (e, targetSource, targetIndex) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        performDrop(data, targetSource, targetIndex);
    };

    const handleMouseDragOver = (e) => {
        e.preventDefault();
    };

    // Touch D&D handlers
    const handleTouchStart = (e, item, source, index) => {
        e.preventDefault(); // Prevent scrolling while dragging
        setDraggedItemInfo({ item, source, index });
    };

    const handleTouchMove = (e) => {
        if (!draggedItemInfo) return;
        
        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (!targetElement) {
            dragOverTargetRef.current = null;
            return;
        }

        const dropZone = targetElement.closest('[data-dropzone-type]');
        if (dropZone) {
            // FIX: Cast `dropZone` from `Element` to `HTMLElement` to access the `dataset` property, which does not exist on the base `Element` type. This resolves the TypeScript error.
            const htmlDropZone = dropZone as HTMLElement;
            const targetSource = htmlDropZone.dataset.dropzoneType;
            const targetIndex = parseInt(htmlDropZone.dataset.dropzoneIndex!, 10);
            dragOverTargetRef.current = { targetSource, targetIndex };
        } else {
            dragOverTargetRef.current = null;
        }
    };

    const handleTouchEnd = () => {
        if (draggedItemInfo && dragOverTargetRef.current) {
            const { targetSource, targetIndex } = dragOverTargetRef.current;
            performDrop(draggedItemInfo, targetSource, targetIndex);
        }
        setDraggedItemInfo(null);
        dragOverTargetRef.current = null;
    };


    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentProblem.type === 'sorting') {
            if (sortedItems.every(item => item !== null)) {
                onSubmitAnswer(sortedItems);
            } else {
                alert("Please sort all the items!");
            }
        } else if (answer.trim() || currentProblem.type === 'telling-time-interactive') {
            onSubmitAnswer(answer.trim());
        }
    };
    
    // SVG-like components for money
    const OneDollarBill = (props) => (<div {...props} className="w-28 h-12 bg-green-100 border-2 border-green-700 rounded-md flex items-center justify-center relative shadow-md"><span className="text-green-800 font-bold text-lg">1</span><span className="absolute top-0 left-1 text-green-800 font-bold text-xs">1</span><span className="absolute bottom-0 right-1 text-green-800 font-bold text-xs">1</span></div>);
    const FiveDollarBill = (props) => (<div {...props} className="w-28 h-12 bg-green-100 border-2 border-green-700 rounded-md flex items-center justify-center relative shadow-md"><span className="text-green-800 font-bold text-lg">5</span><span className="absolute top-0 left-1 text-green-800 font-bold text-xs">5</span><span className="absolute bottom-0 right-1 text-green-800 font-bold text-xs">5</span></div>);
    const Quarter = (props) => (<div {...props} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-gray-500 flex items-center justify-center shadow-sm"><span className="text-gray-700 text-xs font-bold">25¢</span></div>);
    const Dime = (props) => (<div {...props} className="w-7 h-7 rounded-full bg-gray-300 border-2 border-gray-500 flex items-center justify-center shadow-sm"><span className="text-gray-700 text-[9px] font-bold">10¢</span></div>);
    const Nickel = (props) => (<div {...props} className="w-9 h-9 rounded-full bg-gray-300 border-2 border-gray-500 flex items-center justify-center shadow-sm"><span className="text-gray-700 text-xs font-bold">5¢</span></div>);
    const Penny = (props) => (<div {...props} className="w-8 h-8 rounded-full bg-orange-300 border-2 border-orange-600 flex items-center justify-center shadow-sm"><span className="text-orange-800 text-xs font-bold">1¢</span></div>);

    const renderMoney = ({ bills, coins }) => {
        // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
        // This ensures the type is correctly resolved from the imported React module.
        const elements: React.ReactElement[] = [];
        if (bills) {
            for (const [type, count] of Object.entries(bills)) {
                for (let i = 0; i < (count as number); i++) {
                    elements.push(
                        type === '1s' ? <OneDollarBill key={`1s-${i}`} /> : <FiveDollarBill key={`5s-${i}`} />
                    );
                }
            }
        }
        if (coins) {
            for (const [type, count] of Object.entries(coins)) {
                 for (let i = 0; i < (count as number); i++) {
                    switch(type) {
                        case 'quarters': elements.push(<Quarter key={`q-${i}`} />); break;
                        case 'dimes': elements.push(<Dime key={`d-${i}`} />); break;
                        case 'nickels': elements.push(<Nickel key={`n-${i}`} />); break;
                        case 'pennies': elements.push(<Penny key={`p-${i}`} />); break;
                    }
                 }
            }
        }
        return elements;
    };


    const renderProblem = () => {
        if (!currentProblem) return <p>Loading problem...</p>;
        switch (currentProblem.type) {
            case 'counting':
                 return (
                    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 text-2xl font-bold">
                        <div className="flex flex-wrap gap-1 justify-center p-2 border rounded-lg bg-gray-50 max-w-sm">
                             {Array.from({ length: currentProblem.data.count }).map((_, i) => <BlockIcon key={`i-${i}`} block={currentProblem.data.icon} size="h-6 w-6" images={loadedImages}/>)}
                        </div>
                    </div>
                );
            case 'picto':
                return (
                    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 text-2xl font-bold max-w-sm mx-auto">
                        <div className="flex flex-wrap gap-1 justify-center p-2 border rounded-lg bg-gray-50">
                            {Array.from({ length: currentProblem.data.initial }).map((_, i) => <BlockIcon key={`i-${i}`} block={currentProblem.data.icon} size="h-6 w-6" images={loadedImages}/>)}
                        </div>
                        {currentProblem.data.operation && <>
                            <span>{currentProblem.data.operation === 'add' ? '+' : '−'}</span>
                            <div className="flex flex-wrap gap-1 justify-center p-2 border rounded-lg bg-gray-50">
                                {Array.from({ length: currentProblem.data.change }).map((_, i) => <BlockIcon key={`c-${i}`} block={currentProblem.data.icon} size="h-6 w-6" images={loadedImages}/>)}
                            </div>
                            <span>= ?</span>
                        </>}
                    </div>
                );
            case 'sorting':
                return (
                    <div className="flex flex-col items-center gap-6 w-full touch-none">
                        <div className="flex justify-center items-center gap-4 p-4 bg-gray-200 rounded-lg w-full">
                            <span className="font-bold text-gray-600">Your Answer:</span>
                            {sortedItems.map((item, index) => (
                                <div
                                    key={index}
                                    onDrop={(e) => handleMouseDrop(e, 'sorted', index)}
                                    onDragOver={handleMouseDragOver}
                                    data-dropzone-type="sorted"
                                    data-dropzone-index={index}
                                    className="w-24 h-24 bg-white border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center"
                                >
                                    {item && (
                                        <div
                                            draggable
                                            onDragStart={(e) => handleMouseDragStart(e, item, 'sorted', index)}
                                            onTouchStart={(e) => handleTouchStart(e, item, 'sorted', index)}
                                            className="cursor-grab"
                                        >
                                            <BlockIcon block={item} size="h-20 w-20" images={loadedImages} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div 
                            onDrop={(e) => handleMouseDrop(e, 'source', -1)}
                            onDragOver={handleMouseDragOver}
                            data-dropzone-type="source"
                            data-dropzone-index={-1}
                            className="flex justify-center items-center gap-4 p-4 bg-gray-100 rounded-lg w-full min-h-[120px]"
                        >
                            {sourceItems.length > 0 ? (
                                sourceItems.map((item, index) => (
                                    <div
                                        key={item}
                                        draggable
                                        onDragStart={(e) => handleMouseDragStart(e, item, 'source', index)}
                                        onTouchStart={(e) => handleTouchStart(e, item, 'source', index)}
                                        className="cursor-grab"
                                    >
                                        <BlockIcon block={item} size="h-20 w-20" images={loadedImages} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">All items placed!</p>
                            )}
                        </div>
                    </div>
                );
            case 'comparison':
            case 'place-value-comparison':
            case 'fraction-identification':
            case 'shape-identification':
                 return (
                     <div className="grid grid-cols-2 gap-4">
                         {currentProblem.data.options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index);
                             return (
                                 <button key={option} onClick={() => onSubmitAnswer(letter)} className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition text-center">
                                     <span className="font-bold text-xl">{letter}: </span>
                                     {currentProblem.type === 'shape-identification' && <div className="text-3xl font-bold">{option}</div>}
                                     {currentProblem.type === 'fraction-identification' && <div className="text-3xl font-mono">{option}</div>}
                                     {currentProblem.type === 'place-value-comparison' && <div className="text-4xl font-bold">{option}</div>}
                                     {currentProblem.type === 'comparison' && (
                                         <div className="flex flex-wrap gap-2 justify-center mt-2">
                                             {Array.from({ length: option === 'A' ? currentProblem.data.groupA.count : currentProblem.data.groupB.count }).map((_, i) => (
                                                 <BlockIcon key={`${letter}-${i}`} block={option === 'A' ? currentProblem.data.groupA.icon : currentProblem.data.groupB.icon} size="h-6 w-6" images={loadedImages} />
                                             ))}
                                         </div>
                                     )}
                                 </button>
                             );
                         })}
                         {currentProblem.data.shape && <div className="col-span-2 flex justify-center items-center h-24">{renderShape(currentProblem.data.shape)}</div>}
                         {currentProblem.data.numerator && <div className="col-span-2 flex justify-center">{renderFraction(currentProblem.data)}</div>}
                     </div>
                 );
            case 'counting-money':
                 return <div className="flex flex-wrap justify-center items-center gap-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    {renderMoney(currentProblem.data)}
                </div>;
            case 'telling-time-interactive':
                 return <InteractiveClockDisplay onTimeChange={setAnswer} />;
            default: return null;
        }
    }
    const renderShape = (shape) => <div className={`shape ${shape.toLowerCase()}`} />;
    const renderFraction = ({ shape, numerator, denominator }) => (
        <div className={`fraction-shape ${shape}`}>
            {Array.from({ length: denominator }).map((_, i) => (
                <div key={i} className={`fraction-part ${i < numerator ? 'shaded' : ''}`} />
            ))}
        </div>
    );


    const numericInputTypes = ['arithmetic', 'counting', 'picto', 'number-recognition', 'counting-money'];
    const mcqTypes = ['comparison', 'place-value-comparison', 'fraction-identification', 'shape-identification'];
    const interactiveTypes = ['telling-time-interactive', 'sorting'];
    
    const isNumeric = currentProblem && numericInputTypes.includes(currentProblem.type);
    const isMcq = currentProblem && mcqTypes.includes(currentProblem.type);
    const isInteractive = currentProblem && interactiveTypes.includes(currentProblem.type);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={obstacleName} maxWidth="max-w-2xl">
            <div className="relative text-gray-800">
                <AnswerFeedback isCorrect={isCorrect} />
                {showInstruction && <InstructionView instruction={instruction} onAcknowledge={onAcknowledgeInstruction} />}

                {isComplete ? (
                    <ChallengeCompleteView rewards={rewards} onClose={onClose} onPlayAgain={() => {}} obstacleName={obstacleName} loadedImages={loadedImages} />
                ) : (
                    currentProblem && (
                        <form onSubmit={handleSubmit} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                            <div className="mb-4 text-center">
                                <p className="text-sm text-gray-500">Problem {currentProblemIndex + 1} of {problems.length}</p>
                                <div className="text-2xl font-bold my-4 min-h-[64px] flex items-center justify-center">
                                    {currentProblem?.data?.numbers && currentProblem.data.operator === '+' ? (
                                        <div className="inline-block font-mono text-3xl text-right">
                                            {currentProblem.data.numbers.map((num, index, arr) => (
                                                <div key={index} className="flex items-center justify-end leading-tight">
                                                    {index === arr.length - 1 && <span className="mr-2 font-sans font-bold text-2xl">+</span>}
                                                    <span className="w-16">{num}</span>
                                                </div>
                                            ))}
                                            <hr className="my-1 border-t-2 border-gray-800" />
                                        </div>
                                    ) : (
                                        <span>{currentProblem.question}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="min-h-[150px] flex items-center justify-center my-4">
                                {renderProblem()}
                            </div>

                            {isNumeric && (
                                <div className="flex flex-col items-center gap-4 mt-4">
                                    <div className="flex items-center text-3xl p-2 border-2 border-gray-400 rounded-lg w-full max-w-xs text-center bg-white min-h-[52px] font-mono tracking-widest">
                                        {currentProblem.type === 'counting-money' && <span className="text-gray-400 mr-2">$</span>}
                                        {answer || <span className="text-gray-400">?</span>}
                                    </div>
                                    <Numpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} allowDecimal={currentProblem.type === 'counting-money'} />
                                </div>
                            )}

                             {(isNumeric || isInteractive) && (
                                <div className="text-center mt-4">
                                    <button type="submit" className="w-full max-w-xs px-6 py-3 bg-lime-600 text-white font-bold rounded-lg hover:bg-lime-700 transition text-xl shadow-lg">
                                        Submit Answer
                                    </button>
                                </div>
                            )}
                            
                            {!isMcq && <div className="text-center mt-6 pt-4 border-t">
                                <button type="button" onClick={onRequestInstruction} className="text-sm text-cyan-600 hover:underline">
                                    Show me how to solve this type of problem
                                </button>
                            </div>}
                        </form>
                    )
                )}
            </div>
             <style>{`
                .shape { border: 4px solid #333; }
                .triangle { width: 0; height: 0; border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 86.6px solid #4A90E2; }
                .square { width: 80px; height: 80px; background: #50E3C2; }
                .rectangle { width: 120px; height: 70px; background: #F5A623; }
                .circle { width: 80px; height: 80px; border-radius: 50%; background: #D0021B; }
                .pentagon { position: relative; width: 80px; box-sizing: content-box; border-width: 40px 15px 0; border-style: solid; border-color: #9013FE transparent; }
                .pentagon:before { content: ""; position: absolute; height: 0; width: 0; top: -70px; left: -15px; border-width: 0 40px 30px; border-style: solid; border-color: transparent transparent #9013FE; }
                .hexagon { position: relative; width: 80px; height: 46.19px; background-color: #BD10E0; margin: 23.1px 0; }
                .hexagon:before, .hexagon:after { content: ""; position: absolute; width: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; }
                .hexagon:before { bottom: 100%; border-bottom: 23.1px solid #BD10E0; }
                .hexagon:after { top: 100%; width: 0; border-top: 23.1px solid #BD10E0; }
                .fraction-shape { display: flex; border: 2px solid #333; }
                .fraction-shape.circle { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; flex-wrap: wrap; }
                .fraction-shape.rectangle { width: 160px; height: 60px; }
                .fraction-part { flex: 1; border-left: 1px solid #333; }
                .fraction-part:first-child { border-left: none; }
                .fraction-part.shaded { background: #7ED321; }
            `}</style>
        </Modal>
    );
};