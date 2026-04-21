const earthRadiusKM  = 6371;

const RATE_CARD = {
    "MINI" : {baseFare : 50, perKM : 12, perMin : 2},
    "SEDAN" : {baseFare : 70, perKM : 15, perMin : 3},
    "SUV" : {baseFare : 100, perKM : 30, perMin : 3},
}

function toRadian(degree){
    return degree*(Math.PI/180);
}

function calculateHaversineDistance(lat1, lng1, lat2, lng2) {
    let dLat = toRadians(lat2 - lat1);
    let dLng = toRadians(lng2 - lng1);
    
    let radLat1 = toRadians(lat1);
    let radLat2 = toRadians(lat2);
    
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}


function calculateBaseFare(distanceKm, estimatedMins, vehicleType) {
    let rates = RATE_CARD[vehicleType];
    if (!rates) throw new Error("Invalid Vehicle Type");
        
    let distanceCharge = distanceKm * rates.perKm;
    let timeCharge = estimatedMins * rates.perMin;
    let totalInitialFare = rates.baseFare + distanceCharge + timeCharge;
    
    return Math.round(totalInitialFare);
}

function calculateSurgeMultiplier(activeUsers, availableDrivers, isRaining) {
    let surgeMultiplier = 1.0;
    
    if (availableDrivers === 0) {
        surgeMultiplier = 2.5; 
    } else {
        let demandRatio = activeUsers / availableDrivers;
        if (demandRatio > 5.0) surgeMultiplier = 2.0;
        else if (demandRatio > 3.0) surgeMultiplier = 1.5;
        else if (demandRatio > 1.5) surgeMultiplier = 1.2;
    }
    
    if (isRaining) surgeMultiplier += 0.3;
    if (surgeMultiplier > 3.0) surgeMultiplier = 3.0;
        
    return surgeMultiplier;
}



function getFinalRideEstimate(pickupLat, pickupLng, dropLat, dropLng, estimatedMins, vehicleType, activeUsers, availableDrivers, isRaining) {
    try {
       
        let distance = calculateHaversineDistance(pickupLat, pickupLng, dropLat, dropLng);
        
       
        let baseFare = calculateBaseFare(distance, estimatedMins, vehicleType);
        
        
        let multiplier = calculateSurgeMultiplier(activeUsers, availableDrivers, isRaining);
        let finalFare = Math.round(baseFare * multiplier);
        
        
        return {
            success: true,
            distanceKm: parseFloat(distance.toFixed(2)),
            baseFare: baseFare,
            surgeMultiplier: multiplier,
            finalEstimatedFare: finalFare
        };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export {
    calculateHaversineDistance,
    calculateBaseFare,
    calculateSurgeMultiplier,
    getFinalRideEstimate
}