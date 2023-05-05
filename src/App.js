import React, { useState, useEffect } from 'react'
import DesignsPage from './Components/DesignsPage'
import ReportsPage from './Components/ReportsPage'
import { ANALYTICS_ROUTE, APP_NAME, DATA_STORE_ROUTE, ME_ROUTE, TEIS_ROUTE, ORGANISATION_UNIT_GROUP_ROUTE } from './api.routes'
import { Button, CircularLoader }
    from '@dhis2/ui'
import Filter from './Components/Filter'
import { PAGE_DESIGN, PAGE_LEGEND, PAGE_REPORT, PAGE_SMS_CONFIG } from './utils/constants'
import {
    AlertBar
} from '@dhis2/ui'
import { cleanAggrateDimensionData, getAggregateDimensionsList, getOrgUnitParentFromHtml, injectDataIntoHtml, inject_tei_into_html, updateAndInjectOtherElementPeriod, updateAndInjectSchoolNames } from './utils/fonctions'
import Scrollbars from 'react-custom-scrollbars-2'
import LegendPage from './Components/LegendPage'
import { NextUIProvider, Modal, Table } from '@nextui-org/react';
import SmsConfigPage from './Components/SmsConfigPage'
import 'antd/dist/antd.css'
import './App.css'



const App = () => {
    const [notification, setNotification] = useState({ visible: false, message: "", type: "success" })
    const [dataStoreReports, setDataStoreReports] = useState([])
    const [isDataStoreReportsCreated, setDataStoreReportsCreated] = useState(false)
    const [renderPage, setRenderPage] = useState(PAGE_REPORT)
    const [selectedReport, setSelectedReport] = useState(null)
    const [dataType, setDataType] = useState(null)

    const [dataValues, setDataValues] = useState([])
    const [orgUnits, setOrgUnits] = useState([])
    const [organisationUnitGroups, setOrganisationUnitGroups] = useState([])
    const [orgUnitLevels, setOrgUnitLevels] = useState([])
    const [maxLevel, setMaxLevel] = useState(null)
    const [minLevel, setMinLevel] = useState(null)
    const [meOrgUnitId, setMeOrgUnitId] = useState(null)

    const [expandedKeys, setExpandedKeys] = useState([])
    const [currentOrgUnits, setCurrentOrgUnits] = useState([])
    const [selectedOrgUnits, setSelectedOrgUnits] = useState([])
    const [selectedProgram, setSelectedProgram] = useState(null)


    const [selectedPeriod, setSelectedPeriod] = useState(null)
    const [searchProperties, setSearchProperties] = useState([])

    const [loadingOrganisationUnits, setLoadingOrganisations] = useState(false)
    const [loadingOrganisationUnitGroups, setLoadingOrganisationUnitGroups] = useState(false)
    const [loadingGetDatas, setLoadingGetDatas] = useState(false)
    const [loadingDataStoreReports, setLoadingDataStoreReports] = useState([])
    const [loadingSendDatas, setLoadingSendDatas] = useState(false)

    const [visibleListTei, setVisibleListTei] = useState(false)
    const [me, setMe] = useState(null)

    // element get from html 
    const [dataTypesFromHTML, setDataTypesFromHTML] = useState([])
    const [selectedDataTypeFromHTML, setSelectedDataTypeFromHTML] = useState(null)
    const [programTrackersFromHTML, setProgramTrackersFromHTML] = useState([])
    const [dataElementsFromHTML, setDataElementsFromHTML] = useState([])
    const [selectedProgramTrackerFromHTML, setSelectedProgramTrackerFromHTML] = useState(null)
    const [searchByAttribute, setSearchByAttribute] = useState(false)

    const [loadingQueryTeiList, setLoadingQueryTeiLIst] = useState(false)
    const [teis, setTeis] = useState([])
    const [selectedTEI, setSelectedTEI] = useState(null)


    useEffect(() => {
        getDataStoreReports()
        loadMe()
        loadOrganisationUnitGroups()
    }, [])

    const handleSaveDataToDataStore = async payload => {
        try {
            setLoadingSendDatas(true)

            const request = await fetch(DATA_STORE_ROUTE.concat('/').concat(APP_NAME).concat('/reports'), {
                method: "put",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            const response = await request.json()
            if (response.status === "ERROR")
                throw response

            setLoadingSendDatas(false)
            setNotification({ visible: true, message: "Update success", type: "success" })
            await getDataStoreReports()
        } catch (err) {
            setLoadingSendDatas(false)
            setNotification({ visible: true, message: err.message, type: "critical" })
        }

    }


    const handleUpdateInformation = async () => {
        try {

            setLoadingGetDatas(true)
            const corresponding_parents = getOrgUnitParentFromHtml(
                currentOrgUnits[0].id,
                orgUnits,
                orgUnitLevels
            )

            const dimensionList = getAggregateDimensionsList(dataStoreReports.reports.find(dataS => dataS.id === selectedReport))

            cleanAggrateDimensionData(dataStoreReports.reports.find(dataS => dataS.id === selectedReport), dataStoreReports.legends, dimensionList)

            for (let dim of dimensionList) {
                try {
                    const route = ANALYTICS_ROUTE
                        .concat("?dimension=ou:")
                        .concat(corresponding_parents?.join(';'))
                        .concat("&dimension=dx:")
                        .concat(dim)
                        .concat("&dimension=pe:")
                        .concat(selectedPeriod)
                    // .concat("&showHierarchy=false&hierarchyMeta=false&includeMetadataDetails=true&includeNumDen=true&skipRounding=false&completedOnly=false&paging=false")

                    const request = await fetch(route)
                    const response = await request.json()

                    if (response.status === "ERROR")
                        throw response


                    setDataValues(response.dataValues)

                    // resetAlltdValue()
                    injectDataIntoHtml(response.dataValues, dataStoreReports.reports.find(dataS => dataS.id === selectedReport) || "", dataStoreReports.legends, orgUnits, orgUnitLevels, currentOrgUnits[0].id)

                } catch (err) {
                }
            }

            setLoadingGetDatas(false)
            handleUpdateOtherElement()

        } catch (err) {
            setLoadingGetDatas(false)
        }
    }

    const handleUpdateOtherElement = () => {
        try {
            const report = dataStoreReports.reports.find(dataS => dataS.id === selectedReport)
            if (report) {
                console.log(selectedPeriod)
                updateAndInjectOtherElementPeriod(report, selectedPeriod)
                updateAndInjectSchoolNames(report, currentOrgUnits[0].id, orgUnits, orgUnitLevels)
            }
        } catch (err) {
            console.log(err)
        }
    }


    const createDataStore = () => {
        fetch(DATA_STORE_ROUTE.concat('/').concat(APP_NAME).concat('/reports'), {
            method: "post",
            headers: {
                "content-type": "application/json"
            },

            body: JSON.stringify({
                reports: [],
                images: [],
                legends: []
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw response

                getDataStoreReports()
            })
            .catch(err => {
                setLoadingDataStoreReports(false)
                setDataStoreReportsCreated(false)
                setLoadingDataStoreReports(false)
            })
    }

    const getDataStoreReports = async _ => {
        try {
            setLoadingDataStoreReports(true)
            const request = await fetch(DATA_STORE_ROUTE.concat('/').concat(APP_NAME).concat('/reports'))

            const response = await request.json()

            if (response.status === "ERROR")
                throw response

            setDataStoreReports(response)
            setDataStoreReportsCreated(true)
            setLoadingDataStoreReports(false)
        } catch (error) {
            createDataStore()
        }
    }

    const loadMe = _ => {
        fetch(ME_ROUTE)
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw response

                setMe(response)
            })
            .catch(err => {
                console.log(err)
            })
    }



    const loadOrganisationUnitGroups = async _ => {
        try {
            setLoadingOrganisationUnitGroups(true)
            const request = await fetch(ORGANISATION_UNIT_GROUP_ROUTE.concat('&fields=id,name,displayName'))

            const response = await request.json()

            if (response.status === "ERROR")
                throw response

            setOrganisationUnitGroups(response.organisationUnitGroups)
            setLoadingOrganisationUnitGroups(false)
        } catch (error) {
            setLoadingOrganisationUnitGroups(false)
            setNotification({ message: error.message, type: 'error', visible: true })
        }
    }



    const handleDesignPage = () => {
        setRenderPage(PAGE_DESIGN)
    }

    const handleReportPage = _ => {
        setRenderPage(PAGE_REPORT)
    }

    const handleLegendPage = _ => {
        setRenderPage(PAGE_LEGEND)
    }

    const handleSmsConfigPage = _ => {
        setRenderPage(PAGE_SMS_CONFIG)
    }

    const generateTeiReport = (tei) => {
        inject_tei_into_html(dataStoreReports?.reports?.find(report => report.id === selectedReport), tei, selectedProgramTrackerFromHTML)
        setVisibleListTei(false)
        setSelectedTEI(tei)
    }

    const queryTeiList = async _ => {
        try {

            if (minLevel && selectedProgramTrackerFromHTML && currentOrgUnits.length > 0) {
                setLoadingQueryTeiLIst(true)

                if (currentOrgUnits.length === 0)
                    throw new Error("Organisation not selected")

                let route = TEIS_ROUTE.concat("?fields=orgUnit,trackedEntityInstance,attributes,enrollments[*]&ou=")
                    .concat(currentOrgUnits[0].id)
                    .concat('&')
                    .concat('ouMode=DESCENDANTS')
                    .concat('&')
                    .concat('program=' + selectedProgramTrackerFromHTML.id)

                if (searchProperties.length > 0) {
                    searchProperties.forEach(p => {
                        if (p.value && p.value?.trim() !== "") {
                            route = route.concat('&attribute='.concat(p.trackedEntityAttribute?.id).concat(':LIKE:' + p.value))
                        }
                    })
                }

                route = route.concat('&')
                    .concat('pageSize=10&page=1&pageSize=10&totalPages=false')


                const request = await fetch(route)
                const response = await request.json()
                if (response.status === "ERROR")
                    throw response


                handleUpdateOtherElement()
                setTeis(response.trackedEntityInstances)
                setLoadingQueryTeiLIst(false)
                setVisibleListTei(true)
            }
        } catch (err) {
            setLoadingQueryTeiLIst(false)
        }
    }

    const RenderContent = () => me && <div className='d-flex' style={{ overflow: "hidden", backgroundColor: "#f3f3f3" }}>
        {/* <div className='px-3  py-2 border-right' style={{ width: "250px", overflow: "hidden", background: "#F8F9FA" }}> */}
        <div className='border-right' style={{ width: "350px", overflow: "hidden" }}>
            <Scrollbars style={{ height: "95vh", width: "100%" }}>
                <div className=' py-2 px-3 ' style={{ margin: "0px auto" }}>

                    {me.authorities.includes("ALL") && (
                        <>
                            <div onClick={() => handleReportPage()} className={'my-menu'.concat(renderPage === PAGE_REPORT ? ' current' : '')}>Reports</div>
                            <div onClick={() => handleDesignPage()} className={'my-menu'.concat(renderPage === PAGE_DESIGN ? ' current' : '')}>Design</div>
                            <div onClick={() => handleLegendPage()} className={'my-menu'.concat(renderPage === PAGE_LEGEND ? ' current' : '')}>Legend</div>
                            <div onClick={() => handleSmsConfigPage()} className={'my-menu'.concat(renderPage === PAGE_SMS_CONFIG ? ' current' : '')}>SMS Config</div>
                            <hr className='text-black' />
                        </>
                    )}

                    <Filter
                        currentOrgUnits={currentOrgUnits}
                        dataStoreReports={dataStoreReports}
                        dataType={dataType}
                        expandedKeys={expandedKeys}
                        handleUpdateInformation={handleUpdateInformation}
                        isDataStoreReportsCreated={isDataStoreReportsCreated}
                        loadingGetDatas={loadingGetDatas}
                        loadingOrganisationUnits={loadingOrganisationUnits}
                        meOrgUnitId={meOrgUnitId}
                        minLevel={minLevel}
                        orgUnits={orgUnits}
                        renderPage={renderPage}
                        selectedOrgUnits={selectedOrgUnits}
                        selectedPeriod={selectedPeriod}
                        selectedReport={selectedReport}
                        setCurrentOrgUnits={setCurrentOrgUnits}
                        setDataType={setDataType}
                        setExpandedKeys={setExpandedKeys}
                        setLoadingOrganisations={setLoadingOrganisations}
                        setMaxLevel={setMaxLevel}
                        setMeOrgUnitId={setMeOrgUnitId}
                        setMinLevel={setMinLevel}
                        setOrgUnitLevels={setOrgUnitLevels}
                        setOrgUnits={setOrgUnits}
                        setSelectedOrgUnits={setSelectedOrgUnits}
                        setSelectedPeriod={setSelectedPeriod}
                        setSelectedReport={setSelectedReport}
                        setSelectedProgram={setSelectedProgram}
                        selectedProgram={selectedProgram}
                        me={me}
                        setSelectedTEI={setSelectedTEI}

                        searchProperties={searchProperties}
                        setSearchProperties={setSearchProperties}
                        dataTypesFromHTML={dataTypesFromHTML}
                        setDataTypesFromHTML={setDataTypesFromHTML}
                        selectedDataTypeFromHTML={selectedDataTypeFromHTML}
                        setSelectedDataTypeFromHTML={setSelectedDataTypeFromHTML}
                        programTrackersFromHTML={programTrackersFromHTML}
                        setProgramTrackersFromHTML={setProgramTrackersFromHTML}
                        selectedProgramTrackerFromHTML={selectedProgramTrackerFromHTML}
                        setSelectedProgramTrackerFromHTML={setSelectedProgramTrackerFromHTML}
                        searchByAttribute={searchByAttribute}
                        setSearchByAttribute={setSearchByAttribute}
                        queryTeiList={queryTeiList}
                        loadingQueryTeiList={loadingQueryTeiList}
                        dataElementsFromHTML={dataElementsFromHTML}
                        setDataElementsFromHTML={setDataElementsFromHTML}
                    />
                </div>
            </Scrollbars>
        </div>
        <div style={{ width: "100%", overflow: "auto", height: "95vh" }}>
            <div className='d-flex flex-column justify-content-center py-2 px-3'>
                {
                    renderPage === PAGE_REPORT && (
                        <ReportsPage
                            dataStoreReports={dataStoreReports}
                            selectedReport={dataStoreReports?.reports?.find(dataS => dataS.id === selectedReport)}
                            dataValues={dataValues}
                            searchProperties={searchProperties}
                            minLevel={minLevel}
                            setSearchProperties={setSearchProperties}
                            generateTeiReport={generateTeiReport}
                            setVisibleListTei={setVisibleListTei}
                            visibleListTei={visibleListTei}
                            setLoadingSendDatas={setLoadingSendDatas}
                            loadingSendDatas={loadingSendDatas}
                            setNotification={setNotification}
                            me={me}
                            searchByAttribute={searchByAttribute}
                            queryTeiList={queryTeiList}
                            selectedTEI={selectedTEI}
                            dataTypesFromHTML={dataTypesFromHTML}
                            currentOrgUnits={currentOrgUnits}
                        />
                    )
                }
                {
                    renderPage === PAGE_DESIGN && me.authorities.includes('ALL') && (
                        <DesignsPage
                            dataStoreReports={dataStoreReports}
                            setNotification={setNotification}
                            handleSaveDataToDataStore={handleSaveDataToDataStore}
                            loadingSendDatas={loadingSendDatas}
                            organisationUnitLevels={orgUnitLevels}
                            handleReportPage={handleReportPage}
                            setLoadingSendDatas={setLoadingSendDatas}
                            me={me}
                            organisationUnitGroups={organisationUnitGroups}
                            loadingDataStoreReports={loadingDataStoreReports}
                        />
                    )
                }

                {
                    renderPage === PAGE_LEGEND && me.authorities.includes('ALL') && (
                        <LegendPage
                            dataStoreReports={dataStoreReports}
                            loadingSendDatas={loadingSendDatas}
                            handleSaveDataToDataStore={handleSaveDataToDataStore}
                            setNotification={setNotification}
                            setLoadingSendDatas={setLoadingSendDatas}
                            me={me}
                            loadingDataStoreReports={loadingDataStoreReports}
                        />
                    )
                }

                {
                    renderPage === PAGE_SMS_CONFIG && me.authorities.includes('ALL') && (
                        <SmsConfigPage
                            dataStoreReports={dataStoreReports}
                            loadingSendDatas={loadingSendDatas}
                            handleSaveDataToDataStore={handleSaveDataToDataStore}
                            setNotification={setNotification}
                            setLoadingSendDatas={setLoadingSendDatas}
                            me={me}
                        />
                    )
                }
            </div>
        </div>
    </div>


    const RenderListTeiModal = () => (
        <Modal
            scroll
            width="1300px"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            open={visibleListTei}
            onClose={() => setVisibleListTei(false)}
            closeButton
            blur
            preventClose
        >
            <Modal.Header>
                <div className='font-weight-bold fs-4'>
                    Tracked Entity instances
                </div>
            </Modal.Header>
            <Modal.Body>
                <div >
                    {teis.length === 0 && <div> NO DATA </div>}
                    {teis.length > 0 && <Table
                        aria-label="Example table with static content"
                        css={{
                            height: "auto",
                            width: "100%",
                        }}
                        striped
                        sticked
                    >
                        <Table.Header>
                            {selectedProgramTrackerFromHTML?.programTrackedEntityAttributes?.map(att => (
                                <Table.Column key={att.id}>{att?.trackedEntityAttribute?.name}</Table.Column>
                            ))}
                            <Table.Column>Actions</Table.Column>
                        </Table.Header>
                        <Table.Body>

                            {teis.map((tei, index) => (
                                <Table.Row key={index}>
                                    {selectedProgramTrackerFromHTML?.programTrackedEntityAttributes?.map(programTrackedEntityAttribute => (
                                        <Table.Cell key={programTrackedEntityAttribute.trackedEntityAttribute.id}>
                                            {tei.attributes.find(attribute => attribute.attribute === programTrackedEntityAttribute.trackedEntityAttribute.id)?.value}
                                        </Table.Cell>
                                    ))}
                                    <Table.Cell>
                                        <Button primary small onClick={() => generateTeiReport(tei)} >report</Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}

                        </Table.Body>
                    </Table>}

                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setVisibleListTei(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )


    const Notification = () => notification && notification.visible ? (
        <div style={{ zIndex: 2000, position: "fixed", bottom: 5, right: 10 }}>
            <AlertBar
                duration={3000}
                success={notification.type === "success" ? true : false}
                critical={notification.type === "critical" ? true : false}
                warning={notification.type === "warning" ? true : false}
                onHidden={() => setNotification({ ...notification, visible: false })}
            >
                {notification.message}
            </AlertBar>
        </div>
    ) : <></>

    return (
        <NextUIProvider>
            <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
                {
                    loadingDataStoreReports && (
                        <div className='d-flex align-items-center'>
                            <div> <CircularLoader /> </div>
                            <div className='ml-3'> Loading configurations</div>
                        </div>
                    )
                }
                {isDataStoreReportsCreated && me && RenderContent()}
                {RenderListTeiModal()}
                <Notification />
            </div>
        </NextUIProvider>

    )
}

export default App