const Mservice = require("./mSevice");

const DEFAULT_PAGE_SIZE = 10;

module.exports = {
	initMroute: function (app, seneca) {
		app.get('/sourcing/company', commonMiddleware, (req, res) => { searchCompany(req, res, seneca) });
		app.get('/sourcing/companyDetail', commonMiddleware, (req, res) => { companyDetail(req, res, seneca) });

		async function searchCompany(req, res, seneca) {
			console.log("req.query:", req.query)
			let companies = [];
			let count = 0;
			const keyword = req.query.searchString;
			const gongYiList = req.query.gongYiList;
			const areaKeyList = req.query.areaKeyList;
			const industryList = req.query.industryList;
			const factory = req.query.factoryArea;
			const employee = req.query.employeeNumber;
			const annual = req.query.annual;
			const certification = req.query.certification;
			const researcher = req.query.researchNumber;
			let pageSize = req.query.pageSize || DEFAULT_PAGE_SIZE;
			let pageIndex = req.query.pageIndex || 0;
			pageIndex = parseInt(pageIndex);
			pageSize = parseInt(pageSize);
			const result = await Mservice.actAsync(seneca, {
				module: 'sourcing',
				controller: 'graphql',
				args: {
					query: companiesQuery,
					variables: {
						keyword, gongYiList, areaKeyList, industryList, factory, employee, annual, certification, researcher, pageIndex, pageSize
					}
				}
			})
			console.log("result:", result);
			if (result.data && result.data.companies) {
				companies = result.data.companies.companies;
				count = result.data.companies.count;
			}
			return res.json({ companies, pageSize, pageIndex, count, isHome: true });
		}
		async function companyDetail(req, res, seneca) {
			let companyDetail;
			const id = req.query.id;
			if (id) {
				let result = Mservice.actSync(seneca, {
					module: 'sourcing',
					controller: 'graphql',
					args: {
						query: companyDetailQuery,
						variables: {
							id
						}
					}
				})
				if (result.data && result.data.companyDetail)
					companyDetail = result.data.companyDetail;
			}
			return res.json({ companyDetail: companyDetail || {} })
		}
		async function commonMiddleware(req, res, next) {
			const lang = (req.query && req.query.lang) || "cn";
			let category = await getCategory('gongyi');
			const gongyiCategory = getCategoryByLang(category, lang);

			category = await getCategory('area');
			const areaCategory = getCategoryByLang(category, lang);

			category = await getCategory('industry');
			const industryCategory = getCategoryByLang(category, lang);

			category = await getCategory('more');
			const moreCategory = getCategoryByLang(category, lang);

			category = await getCategory('annual');
			const annualCategory = getCategoryByLang(category, lang);

			category = await getCategory('importExportRights');
			const importExportRightsCategory = getCategoryByLang(category, lang);

			category = await getCategory('importExportShare');
			const importExportShareCategory = getCategoryByLang(category, lang);

			category = await getCategory('mainCustormerShare');
			const mainCustormerShareCategory = getCategoryByLang(category, lang);

			category = await getCategory('orderType');
			const orderTypeCategory = getCategoryByLang(category, lang);

			category = await getCategory('cleanroomGrade');
			const cleanroomGradeCategory = getCategoryByLang(category, lang);

			category = await getCategory('useYears');
			const useYearsCategory = getCategoryByLang(category, lang);

			category = await getCategory('certifacteYears');
			const certifacteYearsCategory = getCategoryByLang(category, lang);

			category = await getCategory('patentTypes');
			const patentTypesCategory = getCategoryByLang(category, lang);

			category = await getCategory('sysTypes');
			const sysTypesCategory = getCategoryByLang(category, lang);

			category = await getCategory('currency');
			const currencyCategory = getCategoryByLang(category, lang);

			category = await getCategory('companyNature');
			const companyNatureCategory = getCategoryByLang(category, lang);

			category = await getCategory('subCompanyTypes');
			const subCompanyTypesCategory = getCategoryByLang(category, lang);

			category = await getCategory('cities');
			const citiesCategory = getCategoryByLang(category, lang);

			const typeMap = {}

			if (moreCategory) {
				for (let codeValue of moreCategory) {
					category = await getCategory(codeValue.code);
					let langCategory = [];
					if (category) {
						langCategory = getCategoryByLang(category, lang);
					}
					typeMap[codeValue.code] = langCategory;
				}
			}

			res.locals.GongYiKeywords = gongyiCategory;
			res.locals.AreaKeywords = areaCategory;
			res.locals.IndustryKeywords = industryCategory;
			res.locals.typeMap = typeMap;

			res.locals.gongyiCategory = convertToMap(gongyiCategory);
			res.locals.areaCategory = convertToMap(areaCategory);
			res.locals.industryCategory = convertToMap(industryCategory);

			res.locals.moreCategory = convertToMap(moreCategory);

			res.locals.factoryAreaCategory = convertToMap(typeMap['factoryArea']);
			res.locals.employeeNumberCategory = convertToMap(typeMap['employeeNumber'])
			res.locals.annualCategory = convertToMap(typeMap['annual'])
			res.locals.researchNumberCategory = convertToMap(typeMap['researchNumber'])
			res.locals.certificationCategory = convertToMap(typeMap['certification'])

			//res.locals.annualCategory = convertToMap(annualCategory);
			res.locals.importExportRightsCategory = convertToMap(importExportRightsCategory);
			res.locals.importExportShareCategory = convertToMap(importExportShareCategory)
			res.locals.mainCustormerShareCategory = convertToMap(mainCustormerShareCategory)
			res.locals.orderTypeCategory = convertToMap(orderTypeCategory)
			res.locals.cleanroomGradeCategory = convertToMap(cleanroomGradeCategory)
			res.locals.useYearsCategory = convertToMap(useYearsCategory)
			res.locals.certifacteYearsCategory = convertToMap(certifacteYearsCategory)
			res.locals.patentTypesCategory = convertToMap(patentTypesCategory)
			res.locals.sysTypesCategory = convertToMap(sysTypesCategory)
			res.locals.currencyCategory = convertToMap(currencyCategory)
			res.locals.companyNatureCategory = convertToMap(companyNatureCategory)
			res.locals.subCompanyTypesCategory = convertToMap(subCompanyTypesCategory)
			res.locals.citiesCategory = convertToMap(citiesCategory)

			next();
		}
		async function getCategory(type) {
			const req = {
				module: 'sourcing',
				controller: 'category',
				action: 'getCategory',
				args: {
					type
				}
			}
			return Mservice.actAsync(seneca, req);
		}
		function getCategoryByLang(category, lang) {
			if (category) {
				return category.codeValues.map(codeValue => {
					let value = codeValue['value_' + lang] || codeValue['value_en'] || codeValue.code
					return { code: codeValue.code, value }
				})
			} else {
				return []
			}
		}
		function convertToMap(category) {
			let map = {};
			if (!category) return map;
			category.forEach(item => {
				map[item.code] = item.value
			})
			return map;
		}
	}
}

const companiesQuery = `
	query companies($keyword: String, $gongYiList: String, $areaKeyList: String, $industryList: String, $factory: String, $employee: String, $annual: String, $certification: String, $researcher: String, $pageSize: Int, $pageIndex: Int) {
	  companies(keyword: $keyword, gongYiList: $gongYiList, areaKeyList: $areaKeyList, industryList: $industryList, factory: $factory, employee: $employee, annual: $annual, certification: $certification, researcher: $researcher, pageSize: $pageSize, pageIndex: $pageIndex) {
	    companies {
	    _id
	    title
	    introduction
	    logoUrl
	    companyNature
	    area
	    establishedYear
	    creditCode
	    internetSide
	    shareholders {
	    	name
	    	share
	    }
	    keyWordClssifacation
	    employeeNumber
	    RDDesignEmployee {
	    	employeeNumber
	    	share
	    }
	    techEmployee {
	    	employeeNumber
	    	share
	    }
	    QIEmployee {
	    	employeeNumber
	    	share
	    }
	    companyIndustryCustomer {
	    	mainMarkets
	    }
	    annualOutputValue
	    maxAnnualOutputValue
	    importExport {
	    	rights
	    	share
	    }
	    keyFeatures
	    factoryArea
	    certifications
		photos {
			entity
			type
			attachment{
				fileName
				url
			}
		}
		}
		count

	  }
	}
`;

const companyDetailQuery = `
	query companyDetail($id: String!) {
		companyDetail(id: $id) {
			_id
			logoUrl
			title
			companyNature
			introduction
			area
			companyNature
			establishedYear
			creditCode
			internetSide					
			keyFeatures
			annualOutputValue
			maxAnnualOutputValue
			employeeNumber
			keyWordClssifacation
			RDDesignEmployee{
				employeeNumber
				share
			}
			techEmployee{
				employeeNumber
				share
			}
			QIEmployee{
				employeeNumber
				share
			}
			shareholders{
				name
				share
			}
			importExport{
				rights
				share
			}
			photos {
				_id
				entity
				type
				attachment{
					fileName
					url
				}
			}
			subCompanies {
				_id
				companyId
				subCompanies{
					title
					country
					city
					employeeNumber
					type
				}
			}
			companyIndustryCustomer{
				_id
				companyId
				mainCustormers{
					name
					share
				}
				orderTypes
				mainMarkets
				cooperateCompanies
				majorProducts
			}
			companyIP{
				_id
				companyId
				patentLicenseAgreement
				patentholderAgreement
				crossAgreement
				RDPatents{
					patentNumber
					title
					patentType
					getDate
				}
			}
			companyVenueFacilities{
				_id
				companyId
				factoryArea
				cleanroomGrade
				cleanroomArea
				productionWorkshopArea
				keyFeatureWorkshopArea
				RDFacilitiesArea
				desc
			}
			companyDevice{
				_id
				companyId
				title
				typeName
				deviceNumber
				brandTitle
				typeNumber
				sizeRange
				precision
				useYears
				desc
			}
			companyQualitySystem{
				_id
				companyId
				componentsDefectRate
				assemblyUnitDefectRate
				accurateDeliveryRate
				certifications{
					fileName
					qualitySystem
					year
					validityDate
				}
			}
			companyAppSystem{
				_id
				title
				sysType
				useYear
				hardware
				software
				application
				companyId
			}
			companyLogistics{
				_id
				companyId
				title
				landTransport
				airTransport
				waterTransport
				insuranceCompany
			}
			companyAfterSale{
				_id
				companyId
				globalServiceCenterArea
				detailAddress
				contactWay
				serviceability
				engineersNumber
				sparePartsNumber
			}
			companyBank{
				_id
				companyId
				currency
				title
				branchTitle
				account
			}
			companyAttachments{
				_id
				entityId
				entity
				type
				attachment{
					fileName
					url
				}
			}
			companyContactWay{
				_id
				companyId
				name
				jobtitle
				tel
				email
				legalPersonName
				legalPersonTel
				legalPersonEmail
			}
		}
	}
`;