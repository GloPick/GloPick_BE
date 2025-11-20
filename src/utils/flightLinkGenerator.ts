const airportCodeMap: Record<string, string> = {
  ICN: "Incheon International Airport (ICN)",
  GMP: "Gimpo International Airport (GMP)",
  PUS: "Gimhae International Airport (PUS)",
  TAE: "Daegu International Airport (TAE)",
  MWX: "Muan International Airport (MWX)",
  CJJ: "Cheongju International Airport (CJJ)",
  YNY: "Yangyang International Airport (YNY)",
  CJU: "Jeju International Airport (CJU)",
};

export function createFlightLinks(departureCode: string, arrivalCity: string) {
  const encodedDep = encodeURIComponent(
    airportCodeMap[departureCode] || departureCode
  );
  const encodedArr = encodeURIComponent(arrivalCity);

  const googleFlights = `https://www.google.com/travel/flights?q=Flights from ${encodedDep} to ${encodedArr}/one way`;

  const skyscanner = departureCode
    ? `https://www.skyscanner.co.kr/transport/flights/${departureCode.toLowerCase()}/${encodeURIComponent(
        arrivalCity.toLowerCase()
      )}/`
    : null;

  return {
    googleFlights,
    skyscanner,
  };
}
