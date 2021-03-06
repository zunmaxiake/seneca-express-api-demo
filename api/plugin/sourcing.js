const Mservice = require("./mSevice");

const DEFAULT_PAGE_SIZE = 10;

module.exports = {
	initMroute: function (app, seneca) {
		app.get('/sourcing/company', commonMiddleware, (req, res) => { searchCompany(req, res, seneca) });
		app.get('/sourcing/companyDetail', commonMiddleware, (req, res) => { companyDetail(req, res, seneca) });
		app.post('/sourcing/company/update', commonMiddleware, (req, res) => { companyUpdate(req, res, seneca) });

		/**
		 * @api {get} /sourcing/company Request Company list information
		 * @apiName searchCompany
		 * @apiGroup Company
		 * @apiVersion 0.1.0
		 * @apiParam {String} searchString Company's keyword.
		 * @apiParam {String} gongYiList
		 * @apiParam {String} areaKeyList
		 * @apiParam {String} industryList
		 * @apiParam {String} factoryArea
		 * @apiParam {String} employeeNumber
		 * @apiParam {String} annual
		 * @apiParam {String} certification
		 * @apiParam {String} researchNumber
		 * @apiParam {String} pageSize
		 * @apiParam {String} pageIndex
		 *
		 * @apiSuccess {Number} code      code
		 * @apiSuccess {String} message     提示，当code不是200时提示该错误
		 * @apiSuccess {Object} data 数据部分
		 * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "code":200,
   *        "data":{
							"companies": [
								{
									"_id": "5d1c494f252374356417388e",
									"title": "东莞市新光五金有限公司",
									"introduction": "东莞市新光五金有限公司创建于1996年，位于广东省东莞市长安镇厦岗南面工业区，是一家专业生产箱包、手袋、制鞋、制衣等行业的各种压铸锌合金饰品配件；以及专业生产工业用华司（垫圈）与组合螺丝用华司（垫圈）、弹垫、挡圈、卡环、E扣、精密电子配件、螺母等各种类型冲压五金配件,另外，我们有四个分厂，涉及模具制造，塑胶零件注塑成型，螺母螺丝加工，数控车床加工件，自动车床加工件,精密进口先进的五轴，四轴，三轴电脑锣加工件。 公司引进台湾先进的专业机器及周边设备，借鉴台湾、香港和大陆数十年之模具制造经验，凭着坚实的研发能力，为客户提供品质优良且价格合理之产品。与客户紧密配合，以满足客户生产需求为己任。",
									"logoUrl": "",
									"companyNature": "民营",
									"area": [
										"China",
										"Japan",
										"Korea"
									],
									"establishedYear": "1996",
									"creditCode": "123456789123456789",
									"internetSide": " http://www.l-tooling.com",
									"shareholders": [
										{
											"name": "张三",
											"share": 50
										},
										{
											"name": "李四 ",
											"share": 25
										},
										{
											"name": "王五",
											"share": 25
										}
									],
									"keyWordClssifacation": [
										"engineering",
										"semiconductor",
										"electronics"
									],
									"employeeNumber": " 500-1000",
									"RDDesignEmployee": {
										"employeeNumber": "300",
										"share": 10
									},
									"techEmployee": {
										"employeeNumber": "300",
										"share": 10
									},
									"QIEmployee": {
										"employeeNumber": "100",
										"share": 10
									},
									"annualOutputValue": "5000000",
									"maxAnnualOutputValue": "5000000",
									"importExport": {
										"rights": "Y",
										"share": 10
									},
									"keyFeatures": [
										"smithing",
										"plating",
										"bearing"
									],
									"factoryArea": "50000",
									"certifications": [
										"ISO9001"
									]
								}
							],
							"pageSize": 10,
							"pageIndex": 0,
							"count": 1,
							"isHome": true
						},
   *         "message":"success"
   *     }
   * @apiError QueryError
   * @apiErrorExample {json} 服务器错误:
   *     HTTP/1.1 200 OK
   *     {
   *        code: 500,
   *        message: '查询错误',
   *     }
   */
		async function searchCompany(req, res, seneca) {
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
					source: companiesQuery,
					variables: {
						keyword, gongYiList, areaKeyList, industryList, factory, employee, annual, certification, researcher, pageIndex, pageSize
					}
				}
			})
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
				let result = await Mservice.actAsync(seneca, {
					module: 'sourcing',
					controller: 'graphql',
					args: {
						source: companyDetailQuery,
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
		/**
		 * @api {post} /sourcing/company/update 修改公司基本信息
		 * @apiName updateCompany
		 * @apiGroup Company
		 * @apiVersion 0.1.0
		 * @apiParamExample {json} Request-Example:
		 * {
					"id" : "5d1c494f252374356417388e",
					"keyword" : "工程机械,汽车,电子行业,涂装,渡银,测试",
					"keyFeatures":"smithing,plating,bearing",
					"areaKeyList" : "China,Japan,Korea",
					"industryList" : "engineering,semiconductor,electronics",
					"factory" : "50000",
					"employee" : " 500-1000",
					"annual" : "5000000",
					"certification" : "ISO9001",
					"researcher" : "300"
				}
				@apiSuccess {Number} code      code
				@apiSuccess {String} message     提示，当code不是200时提示该错误
				@apiSuccess {Object} data 数据部分
				@apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "code":200,
   *        "data":{
								"company": {
									"_id": "5d1c494f252374356417388e",
									"logoUrl": "",
									"title": "东莞市新光五金有限公司",
									"companyNature": "民营",
									"introduction": "东莞市新光五金有限公司创建于1996年，位于广东省东莞市长安镇厦岗南面工业区，是一家专业生产箱包、手袋、制鞋、制衣等行业的各种压铸锌合金饰品配件；以及专业生产工业用华司（垫圈）与组合螺丝用华司（垫圈）、弹垫、挡圈、卡环、E扣、精密电子配件、螺母等各种类型冲压五金配件,另外，我们有四个分厂，涉及模具制造，塑胶零件注塑成型，螺母螺丝加工，数控车床加工件，自动车床加工件,精密进口先进的五轴，四轴，三轴电脑锣加工件。 公司引进台湾先进的专业机器及周边设备，借鉴台湾、香港和大陆数十年之模具制造经验，凭着坚实的研发能力，为客户提供品质优良且价格合理之产品。与客户紧密配合，以满足客户生产需求为己任。",
									"area": [
											"China",
											"Japan",
											"Korea"
									],
									"establishedYear": "1996",
									"creditCode": "123456789123456789",
									"internetSide": " http://www.l-tooling.com",
									"shareholders": [
											{
													"name": "张三",
													"share": 50
											},
											{
													"name": "李四 ",
													"share": 25
											},
											{
													"name": "王五",
													"share": 25
											}
									],
									"keyWordClssifacation": [
											"engineering",
											"semiconductor",
											"electronics"
									],
									"keyWords": [
											"工程机械",
											"汽车",
											"电子行业",
											"涂装",
											"渡银",
											"测试4"
									],
									"employeeNumber": " 500-1000",
									"RDDesignEmployee": {
											"employeeNumber": "300",
											"share": 10
									},
									"techEmployee": {
											"employeeNumber": "300",
											"share": 10
									},
									"QIEmployee": {
											"employeeNumber": "100",
											"share": 10
									},
									"annualOutputValue": "5000000",
									"maxAnnualOutputValue": "5000000",
									"importExport": {
											"rights": "Y",
											"share": 10
									},
									"keyFeatures": [
											"smithing",
											"plating",
											"bearing"
									],
									"factoryArea": "50000",
									"certifications": [
											"ISO9001"
									]
							}
   *         },
   *         "message":"success"
   *     }
   * @apiError QueryError
   * @apiErrorExample {json} 服务器错误:
   *     HTTP/1.1 200 OK
   *     {
   *        code: 500,
   *        message: '修改错误',
   *     }				
		*/
		async function companyUpdate(req, res, seneca) {
			let company;
			const id = req.body.id;
			if (id) {
				const keyword = req.body.keyword || "";
				const gongYiList = req.body.gongYiList || "";
				const areaKeyList = req.body.areaKeyList || "";
				const industryList = req.body.industryList || "";
				const factory = req.body.factory || "";
				const employee = req.body.employee || "";
				const annual = req.body.annual || "";
				const certification = req.body.certification || "";
				const researcher = req.body.researcher || "";
				let result = await Mservice.actAsync(seneca, {
					module: 'sourcing',
					controller: 'graphql',
					args: {
						source: companyUpdateMutation,
						variables: {
							id, keyword, gongYiList, areaKeyList, industryList, factory, employee, annual, certification, researcher
						}
					}
				})
				if (result.data && result.data.updateCompany)
					company = result.data.updateCompany;
			}
			return res.json({ company: company || {} });
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
	    annualOutputValue
	    maxAnnualOutputValue
	    importExport {
	    	rights
	    	share
	    }
	    keyFeatures
	    factoryArea
	    certifications
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

const companyUpdateMutation = `
mutation updateCompany($id: String!, $keyword: String, $gongYiList: String, $areaKeyList: String, $industryList: String, $factory: String, $employee: String, $annual: String, $certification: String, $researcher: String){
		updateCompany(id:$id, keyword:$keyword, gongYiList:$gongYiList, areaKeyList:$areaKeyList, industryList:$industryList, factory:$factory, employee:$employee, annual:$annual, certification:$certification, researcher:$researcher){
			_id
			logoUrl
			title
			companyNature
			introduction
			area
			establishedYear
			creditCode
			internetSide	
			shareholders{
				name
				share
			}
			keyWordClssifacation
			keyWords
			employeeNumber
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
			annualOutputValue
			maxAnnualOutputValue
			importExport{
				rights
				share
			}
			keyFeatures
			factoryArea
			certifications
		}
	}
`