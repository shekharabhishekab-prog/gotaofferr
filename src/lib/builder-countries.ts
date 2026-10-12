export const BUILDER_COUNTRIES: Array<[string, string]> = [
  ["IN","India"],["US","United States"],["GB","United Kingdom"],["CA","Canada"],["AU","Australia"],["NZ","New Zealand"],["IE","Ireland"],
  ["AE","United Arab Emirates"],["SA","Saudi Arabia"],["QA","Qatar"],["KW","Kuwait"],["OM","Oman"],["BH","Bahrain"],
  ["SG","Singapore"],["MY","Malaysia"],["ID","Indonesia"],["TH","Thailand"],["VN","Vietnam"],["PH","Philippines"],
  ["DE","Germany"],["FR","France"],["NL","Netherlands"],["BE","Belgium"],["ES","Spain"],["IT","Italy"],["PT","Portugal"],["CH","Switzerland"],["AT","Austria"],
  ["SE","Sweden"],["NO","Norway"],["DK","Denmark"],["FI","Finland"],["PL","Poland"],["CZ","Czechia"],["RO","Romania"],["GR","Greece"],["HU","Hungary"],["UA","Ukraine"],["TR","Turkey"],
  ["JP","Japan"],["KR","South Korea"],["CN","China"],["HK","Hong Kong"],["TW","Taiwan"],["PK","Pakistan"],["BD","Bangladesh"],["LK","Sri Lanka"],["NP","Nepal"],
  ["BR","Brazil"],["MX","Mexico"],["AR","Argentina"],["CL","Chile"],["CO","Colombia"],["PE","Peru"],
  ["ZA","South Africa"],["NG","Nigeria"],["KE","Kenya"],["GH","Ghana"],["EG","Egypt"],["MA","Morocco"],["JO","Jordan"],["IL","Israel"],["KZ","Kazakhstan"],
];
export const countryName = (code?: string | null) => BUILDER_COUNTRIES.find(([c]) => c === (code ?? "").toUpperCase())?.[1] ?? "";
