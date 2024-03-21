import { toTitleCase } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { VscSettings } from 'react-icons/vsc';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PiGasCan } from 'react-icons/pi';
import { BsBatteryCharging } from 'react-icons/bs';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/custom/modal';

interface CarFiltersProps {
    carDetails: any[];
    setFilteredCars: (filteredCars: any[]) => void;
}

const CarFilters: React.FC<CarFiltersProps> = ({ carDetails, setFilteredCars }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    function openModal() {
        setIsModalOpen(true);
    }
    function closeModal() {
        setIsModalOpen(false);
    }

    const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
    const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
    const [minPricePerHr, setMinPricePerHr] = useState<number>(0);
    const [maxPricePerHr, setMaxPricePerHr] = useState<number>(Infinity);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [seatingCapacityFilters, setSeatingCapacityFilters] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'relevance' | 'lowToHigh' | 'highToLow'>('relevance');
    const [resetSlider, setResetSlider] = useState(false);
    const [range, setRange] = useState([0, 200]);

    const fuelTypes = [
        { icon: <PiGasCan className='w-5 h-5' />, text: 'gasoline' },
        { icon: <BsBatteryCharging className='w-5 h-5' />, text: 'electric' },
    ];
    const ratings = [1, 2, 3, 4, 5];

    const seatings = [2, 4, 5, 6];

    const handleRangeChange = (value: number[]) => {
        setRange(value);
    };

    useEffect(() => {
        setMinPricePerHr(range[0]);
        setMaxPricePerHr(range[1]);
    }, [range]);

    useEffect(() => {
        setTimeout(() => {
            filterCars();
        }, 0);
    }, [selectedMakes, minPricePerHr, maxPricePerHr, selectedRatings, selectedFuelTypes, sortOrder, seatingCapacityFilters]);

    useEffect(() => {
        handleReset();
    }, [carDetails]);

    const handleMakeChange = (make: string) => {
        const updatedMakes = selectedMakes.includes(make.toLowerCase()) ? selectedMakes.filter(m => m !== make.toLowerCase()) : [...selectedMakes, make.toLowerCase()];
        setSelectedMakes(updatedMakes);
    };

    const handleFuelTypeChange = (fuelType: string) => {
        const updatedFuelTypes = selectedFuelTypes.includes(fuelType.toLowerCase())
            ? selectedFuelTypes.filter(m => m !== fuelType.toLowerCase())
            : [...selectedFuelTypes, fuelType.toLowerCase()];
        setSelectedFuelTypes(updatedFuelTypes);
    };

    const handleRatingChange = (rating: number) => {
        const updatedRatings = selectedRatings.includes(rating) ? selectedRatings.filter(r => r !== rating) : [...selectedRatings, rating];
        setSelectedRatings(updatedRatings);
    };

    const handleSeatingCapacityChange = (seatingCapacity: string) => {
        const updatedSeatingCapacityFilters = seatingCapacityFilters.includes(seatingCapacity)
            ? seatingCapacityFilters.filter(capacity => capacity !== seatingCapacity)
            : [...seatingCapacityFilters, seatingCapacity];
        setSeatingCapacityFilters(updatedSeatingCapacityFilters);
    };

    const filterCars = () => {
        let filteredCars = carDetails;

        if (selectedMakes.length > 0) {
            filteredCars = filteredCars.filter(car => selectedMakes.includes(car.make.toLowerCase()));
        }

        if (selectedFuelTypes.length > 0) {
            filteredCars = filteredCars.filter(car => selectedFuelTypes.includes(car.fueltypeprimary?.toLowerCase()));
        }

        filteredCars = filteredCars.filter(car => car.price_per_hr >= minPricePerHr && car.price_per_hr <= maxPricePerHr);

        if (selectedRatings.length > 0) {
            filteredCars = filteredCars.filter(car => {
                return selectedRatings.some(rating => {
                    if (rating === 5) {
                        return car.rating >= rating;
                    }
                    const ratingFloor = rating;
                    const ratingCeil = rating + 1;
                    return car.rating >= ratingFloor && car.rating < ratingCeil;
                });
            });
        }

        if (sortOrder !== 'relevance') {
            filteredCars.sort((a, b) => {
                const sortOrderValue = sortOrder === 'lowToHigh' ? 1 : -1;
                return sortOrderValue * (a.price_per_hr - b.price_per_hr);
            });
        }

        if (seatingCapacityFilters.length > 0) {
            filteredCars = filteredCars.filter(car => {
                if (car.seatingCapacity !== null) {
                    const seatingCapacity = parseInt(car.seatingCapacity);
                    if (seatingCapacityFilters.includes('2') && seatingCapacity === 2) {
                        return true;
                    }
                    if (seatingCapacityFilters.includes('4') && seatingCapacity === 4) {
                        return true;
                    }
                    if (seatingCapacityFilters.includes('5') && seatingCapacity === 5) {
                        return true;
                    }
                    if (seatingCapacityFilters.includes('6') && seatingCapacity === 6) {
                        return true;
                    }
                    if (seatingCapacityFilters.includes('6+') && seatingCapacity >= 6) {
                        return true;
                    }
                    return false;
                }
                return true;
            });
        }

        setFilteredCars(filteredCars);
    };

    const handleReset = () => {
        setSelectedMakes([]);
        setSelectedFuelTypes([]);
        setSelectedRatings([]);
        setSeatingCapacityFilters([]);
        setRange([0, 200]);
        setSortOrder('relevance');
        setResetSlider(!resetSlider);
    };

    const appliedFiltersCount =
        (selectedMakes.length > 0 ? 1 : 0) +
        (selectedFuelTypes.length > 0 ? 1 : 0) +
        (selectedRatings.length > 0 ? 1 : 0) +
        (seatingCapacityFilters.length > 0 ? 1 : 0) +
        (minPricePerHr !== 0 || maxPricePerHr !== 200 ? 1 : 0);

    return (
        <>
            <Button className='flex gap-3 ' variant='outline' type='button' onClick={openModal}>
                <VscSettings className='rotate-90' />
                Filters {appliedFiltersCount > 0 ? <p>({appliedFiltersCount > 0 ? appliedFiltersCount : ''})</p> : null}
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal} className=''>
                <ModalHeader onClose={closeModal}>Filters</ModalHeader>
                <ModalBody className=''>
                    <div className='grid gap-5 grid-cols-1 lg:grid-cols-2'>
                        <div className='  space-y-3 md:space-y-5  select-none md:border-r'>
                            <div className='flex flex-col gap-4 pb-3'>
                                <Label>Sort By Price</Label>
                                <RadioGroup defaultValue='relevance' className=' flex gap-4 items-center'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='relevance' id='r1' checked={sortOrder === 'relevance'} onClick={() => setSortOrder('relevance')} />
                                        <Label htmlFor='r1'>Relevance</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='lowToHigh' id='r2' checked={sortOrder === 'lowToHigh'} onClick={() => setSortOrder('lowToHigh')} />
                                        <Label htmlFor='r2'> Low to High</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='highToLow' id='r3' checked={sortOrder === 'highToLow'} onClick={() => setSortOrder('highToLow')} />
                                        <Label htmlFor='r3'> High to Low</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='flex flex-col gap-4 pb-3'>
                                <Label>Price Range</Label>
                                <div className='md:w-[18rem] w-[19rem]'>
                                    <Slider
                                        // @ts-ignore
                                        defaultValue={[0, 200]}
                                        min={0}
                                        max={200}
                                        step={5}
                                        value={range}
                                        onValueChange={handleRangeChange}
                                        formatLabel={value => `$ ${value}/Day`}
                                        resetValues={resetSlider}
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col gap-4 pb-3'>
                                <Label>Vehicle Make</Label>
                                <div className='flex gap-2 md:gap-4 flex-wrap '>
                                    {Array.from(new Set(carDetails.map(car => car.make.toLowerCase()))).map((make, index) => (
                                        <div
                                            key={index}
                                            className={`flex  items-center rounded-md  cursor-pointer  w-fit text-xs md:text-sm font-medium ${
                                                selectedMakes.includes(make) ? 'bg-primary/80 text-white' : 'bg-black/5 text-neutral-900'
                                            }`}>
                                            <input
                                                type='checkbox'
                                                id={`make-${index}`}
                                                checked={selectedMakes.includes(make)}
                                                onChange={() => handleMakeChange(make)}
                                                className='mr-2 hidden w-full h-full cursor-pointer'
                                            />
                                            <label htmlFor={`make-${index}`} className=' cursor-pointer px-3 py-2'>
                                                {toTitleCase(make)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='  space-y-3 md:space-y-5  select-none '>
                            <div className='flex flex-col gap-4 pb-3'>
                                <Label>Fuel Type</Label>
                                <div className='flex gap-4 flex-wrap'>
                                    {fuelTypes.map((fuelType, index) => (
                                        <div
                                            key={index}
                                            className={`flex  items-center rounded-md  cursor-pointer  w-fit text-sm font-medium ${
                                                selectedFuelTypes.includes(fuelType.text) ? 'bg-primary/80 text-white' : 'bg-black/5 text-neutral-900'
                                            }`}>
                                            <input
                                                type='checkbox'
                                                id={`fuelType-${fuelType.text}`}
                                                checked={selectedFuelTypes.includes(fuelType.text)}
                                                onChange={() => handleFuelTypeChange(fuelType.text)}
                                                className='mr-2 hidden w-full h-full cursor-pointer'
                                            />
                                            <label htmlFor={`fuelType-${fuelType.text}`} className=' cursor-pointer px-3 py-2'>
                                                <div className='flex gap-2'>
                                                    {fuelType.icon}
                                                    {toTitleCase(fuelType.text)}
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-col gap-4 pb-3'>
                                <Label>Ratings</Label>
                                <div className='flex gap-4 flex-wrap '>
                                    {ratings.map((rating, index) => (
                                        <div
                                            key={index}
                                            className={`flex  items-center rounded-md  cursor-pointer  w-fit text-sm font-medium ${
                                                selectedRatings.includes(rating) ? 'bg-primary/80 text-white' : 'bg-black/5 text-neutral-900'
                                            }`}>
                                            <input
                                                type='checkbox'
                                                id={`rating-${rating}`}
                                                value={rating}
                                                checked={selectedRatings.includes(rating)}
                                                onChange={() => handleRatingChange(rating)}
                                                className='mr-2 hidden w-full h-full cursor-pointer'
                                            />
                                            <label htmlFor={`rating-${rating}`} className=' cursor-pointer px-3 py-1'>
                                                {rating} <span className='text-lg'>&#9733;</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-col gap-4 pb-3'>
                                <Label>No of Seats</Label>
                                <div className='flex gap-4 flex-wrap'>
                                    {seatings.map((seating, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center rounded-md cursor-pointer w-fit text-sm font-medium ${
                                                seatingCapacityFilters.includes(String(seating)) ? 'bg-primary/80 text-white' : 'bg-black/5 text-neutral-900'
                                            }`}>
                                            <input
                                                type='checkbox'
                                                id={`seating-${seating}`}
                                                value={seating}
                                                checked={seatingCapacityFilters.includes(String(seating))}
                                                onChange={() => handleSeatingCapacityChange(String(seating))}
                                                className='mr-2 hidden w-full h-full cursor-pointer'
                                            />
                                            <label htmlFor={`seating-${seating}`} className='cursor-pointer px-3 py-1'>
                                                {seating} Seater
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button type='button' variant='outline' onClick={handleReset} className='w-full sm:w-auto '>
                        Reset All
                    </Button>

                    <Button type='button' variant='black' className='w-full sm:w-auto ' onClick={closeModal}>
                        Apply Filters
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default CarFilters;
