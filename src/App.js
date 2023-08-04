import React, { useState, useEffect } from 'react'
import DesignsPage from './Components/DesignsPage'
import ReportsPage from './Components/ReportsPage'
import { ANALYTICS_ROUTE, ME_ROUTE, TEIS_ROUTE, ORGANISATION_UNIT_GROUP_ROUTE } from './api.routes'
import { Button, CircularLoader }
    from '@dhis2/ui'
import Filter from './Components/Filter'
import { DAY, MONTH, NOTIFICATON_CRITICAL, PAGE_DESIGN, PAGE_LEGEND, PAGE_REPORT, PAGE_SMS_CONFIG, YEAR, YEARLY } from './utils/constants'

import { cleanAggrateDimensionData, getAggregateDimensionsList, getOrgUnitParentFromHtml, injectDataIntoHtml, inject_tei_into_html, loadDataStore, updateAndInjectOtherElementPeriod, updateAndInjectSchoolNames } from './utils/fonctions'
import LegendPage from './Components/LegendPage'
import { NextUIProvider, Modal, Table } from '@nextui-org/react';
import SmsConfigPage from './Components/SmsConfigPage'
import MyNotification from './Components/MyNotification'
import { TbReportSearch } from 'react-icons/tb'
import { LuClipboardEdit } from 'react-icons/lu'
import { GrDocumentConfig } from 'react-icons/gr'
import { BiMessageDetail } from 'react-icons/bi'
// import 'antd/dist/antd.css'
import 'antd/dist/reset.css'
import './App.css'
import Period from './Components/Period'
import dayjs from 'dayjs'



const App = () => {
    const [notif, setNotif] = useState({ show: false, message: null, type: null })

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
    const [reports, setReports] = useState([])
    const [legends, setLegends] = useState([])
    const [images, setImages] = useState([])
    const [smsConfigs, setSmsConfigs] = useState([])
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
    const [loadingDataStoreInitialization, setLoadingDataStoreInitialization] = useState(false)
    const [loadingSmsConfigs, setLoadingSmsConfigs] = useState(false)
    const [loadingImages, setLoadingImages] = useState(false)
    const [loadingLegends, setLoadingLegends] = useState(false)
    const [loadingReports, setLoadingReports] = useState(false)

    const [visibleListTei, setVisibleListTei] = useState(false)
    const [me, setMe] = useState(null)

    const [dataTypesFromHTML, setDataTypesFromHTML] = useState([])
    const [selectedDataTypeFromHTML, setSelectedDataTypeFromHTML] = useState(null)
    const [programTrackersFromHTML, setProgramTrackersFromHTML] = useState([])
    const [dataElementsFromHTML, setDataElementsFromHTML] = useState([])

    const [selectedProgramTrackerFromHTML, setSelectedProgramTrackerFromHTML] = useState(null)
    const [searchByAttribute, setSearchByAttribute] = useState(false)

    const [loadingQueryTeiList, setLoadingQueryTeiLIst] = useState(false)
    const [teis, setTeis] = useState([])
    const [selectedTEI, setSelectedTEI] = useState(null)

    const [selectedPeriodType, setSelectedPeriodType] = useState(YEAR)
    const [visiblePeriodComponent, setVisiblePeriodComponent] = useState(false)

    const [selectedPeriods, setSelectedPeriods] = useState([])


    const initDataStore = async () => {
        try {
            setLoadingDataStoreInitialization(true)
            loadDataStore(process.env.REACT_APP_LEGENDS_KEY, setLoadingLegends, setLegends, [])
            loadDataStore(process.env.REACT_APP_REPORTS_KEY, setLoadingReports, setReports, [])
            loadDataStore(process.env.REACT_APP_IMAGES_KEY, setLoadingImages, setImages, [])
            loadDataStore(process.env.REACT_APP_SMS_CONFIG_KEY, setLoadingSmsConfigs, setSmsConfigs, [])

            await loadMe()
            loadOrganisationUnitGroups()

            setLoadingDataStoreInitialization(false)
            setDataStoreReportsCreated(true)
        } catch (err) {
            setNotif({ show: true, message: err?.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
            setDataStoreReportsCreated(false)
            setLoadingDataStoreInitialization(false)
        }

    }

    const formatPeriodForAnalytic = (period, periodType) => {
        if (periodType === DAY)
            return dayjs(period).format('YYYYMMDD')
        if (periodType === YEAR)
            return dayjs(period).format('YYYY')
        if (periodType === MONTH)
            return dayjs(period).format('YYYYMM')
    }

    const handleUpdateInformation = async () => {
        try {
            setLoadingGetDatas(true)
            setNotif({ show: false, message: null, type: null })
            const corresponding_parents = getOrgUnitParentFromHtml(
                currentOrgUnits[0].id,
                orgUnits,
                orgUnitLevels
            )

            const dimensionList = getAggregateDimensionsList(reports.find(dataS => dataS.id === selectedReport))

            cleanAggrateDimensionData(reports.find(dataS => dataS.id === selectedReport), legends, dimensionList, selectedPeriod, selectedPeriodType)

            console.log("selectedPeriod: ", selectedPeriod)

            for (let dim of dimensionList) {
                try {
                    const route = ANALYTICS_ROUTE
                        .concat("?dimension=ou:")
                        .concat(corresponding_parents?.join(';'))
                        .concat("&dimension=dx:")
                        .concat(dim)
                        .concat("&dimension=pe:")
                        .concat(formatPeriodForAnalytic(selectedPeriod, selectedPeriodType))

                    const request = await fetch(route)
                    const response = await request.json()

                    if (response.status === "ERROR")
                        throw response


                    setDataValues(response.dataValues)

                    // resetAlltdValue()
                    injectDataIntoHtml(response.dataValues, reports.find(dataS => dataS.id === selectedReport) || "", legends, orgUnits, orgUnitLevels, currentOrgUnits[0].id, selectedPeriod, selectedPeriodType, setNotif)

                } catch (err) {
                    console.log(err)
                }
            }

            setLoadingGetDatas(false)
            handleUpdateOtherElement()

        } catch (err) {
            console.log(err)
            setLoadingGetDatas(false)
        }
    }

    const handleUpdateOtherElement = () => {
        try {
            const report = reports.find(dataS => dataS.id === selectedReport)
            if (report) {
                updateAndInjectOtherElementPeriod(report, selectedPeriod)
                updateAndInjectSchoolNames(report, currentOrgUnits[0].id, orgUnits, orgUnitLevels)
            }
        } catch (err) {
        }
    }

    const loadMe = async _ => {
        fetch(ME_ROUTE)
            .then(response => response.json())
            .then(response => {
                if (response.status === "ERROR")
                    throw response

                setMe(response)
            })
            .catch(err => {
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
            setNotif({ message: error.message, type: NOTIFICATON_CRITICAL, show: true })
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
        inject_tei_into_html(reports?.find(report => report.id === selectedReport), tei, selectedProgramTrackerFromHTML, setNotif, legends)
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

    const RenderContent = () => me && (
        <div className='row' style={{ width: '100%', minHeight: '95vh' }}>
            <div className='col-md-2' style={{ borderRight: '1px solid #ccc' }}>
                <div className='py-2 px-3 ' style={{ position: 'sticky', top: '0px' }}>
                    {
                        me.authorities.includes("ALL") && (
                            <>
                                <div onClick={() => handleReportPage()} style={{ display: 'flex', alignItems: 'center' }} className={'my-menu'.concat(renderPage === PAGE_REPORT ? ' current' : '')}>
                                    <span><TbReportSearch style={{ fontSize: '20px' }} /></span>
                                    <span style={{ marginLeft: '10px' }}>Reports</span>
                                </div>
                                <div onClick={() => handleDesignPage()} style={{ display: 'flex', alignItems: 'center' }} className={'my-menu'.concat(renderPage === PAGE_DESIGN ? ' current' : '')}>
                                    <span><LuClipboardEdit style={{ fontSize: '20px' }} /></span>
                                    <span style={{ marginLeft: '10px' }}>Design</span>
                                </div>
                                <div onClick={() => handleLegendPage()} style={{ display: 'flex', alignItems: 'center' }} className={'my-menu'.concat(renderPage === PAGE_LEGEND ? ' current' : '')}>
                                    <span><GrDocumentConfig style={{ fontSize: '20px' }} /></span>
                                    <span style={{ marginLeft: '10px' }}>Legend</span>
                                </div>
                                <div onClick={() => handleSmsConfigPage()} style={{ display: 'flex', alignItems: 'center' }} className={'my-menu'.concat(renderPage === PAGE_SMS_CONFIG ? ' current' : '')}>
                                    <span><BiMessageDetail style={{ fontSize: '20px' }} /></span>
                                    <span style={{ marginLeft: '10px' }}> SMS Config</span>
                                </div>
                                <hr className='text-black' />
                            </>
                        )}

                    <Filter
                        currentOrgUnits={currentOrgUnits}
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
                        loadingLegends={loadingLegends}
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
                        reports={reports}
                        setVisiblePeriodComponent={setVisiblePeriodComponent}
                        setSelectedPeriodType={setSelectedPeriodType}
                        selectedPeriodType={selectedPeriodType}
                        visiblePeriodComponent={visiblePeriodComponent}
                        setSelectedPeriods={setSelectedPeriods}
                    />
                </div>
            </div>
            <div className='col-md-10'>
                <div className='d-flex flex-column justify-content-center'>
                    {
                        renderPage === PAGE_REPORT && (
                            <ReportsPage
                                selectedReport={reports?.find(dataS => dataS.id === selectedReport)}
                                dataValues={dataValues}
                                searchProperties={searchProperties}
                                minLevel={minLevel}
                                setSearchProperties={setSearchProperties}
                                generateTeiReport={generateTeiReport}
                                setVisibleListTei={setVisibleListTei}
                                visibleListTei={visibleListTei}
                                setLoadingSendDatas={setLoadingSendDatas}
                                loadingSendDatas={loadingSendDatas}
                                me={me}
                                searchByAttribute={searchByAttribute}
                                queryTeiList={queryTeiList}
                                selectedTEI={selectedTEI}
                                dataTypesFromHTML={dataTypesFromHTML}
                                currentOrgUnits={currentOrgUnits}
                                setNotif={setNotif}
                                smsConfigs={smsConfigs}
                            />
                        )
                    }
                    {
                        renderPage === PAGE_DESIGN && me.authorities.includes('ALL') && (
                            <DesignsPage
                                loadingSendDatas={loadingSendDatas}
                                organisationUnitLevels={orgUnitLevels}
                                handleReportPage={handleReportPage}
                                setLoadingSendDatas={setLoadingSendDatas}
                                me={me}
                                organisationUnitGroups={organisationUnitGroups}
                                loadingDataStoreReports={loadingDataStoreReports}
                                setNotif={setNotif}
                                reports={reports}
                                legends={legends}
                                images={images}
                                setLoadingReports={setLoadingReports}
                                setReports={setReports}
                                loadingLegends={loadingLegends}
                                loadingReports={loadingReports}
                            />
                        )
                    }

                    {
                        renderPage === PAGE_LEGEND && me.authorities.includes('ALL') && (
                            <LegendPage
                                setLoadingSendDatas={setLoadingSendDatas}
                                me={me}
                                setNotif={setNotif}
                                legends={legends}
                                setLegends={setLegends}
                                loadingLegends={loadingLegends}
                                setLoadingLegends={setLoadingLegends}
                            />
                        )
                    }

                    {
                        renderPage === PAGE_SMS_CONFIG && me.authorities.includes('ALL') && (
                            <SmsConfigPage
                                setLoadingSendDatas={setLoadingSendDatas}
                                me={me}
                                setNotif={setNotif}
                                reports={reports}
                                legends={legends}
                                loadingSmsConfigs={loadingSmsConfigs}
                                setLoadingSmsConfigs={setLoadingSmsConfigs}
                                smsConfigs={smsConfigs}
                                setSmsConfigs={setSmsConfigs}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )


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


    useEffect(() => {
        initDataStore()
    }, [])

    return (
        <NextUIProvider>
            <div style={{ minHeight: '95vh', backgroundColor: "#f3f3f3" }}>
                {
                    loadingDataStoreInitialization && (
                        <div className='d-flex align-items-center'>
                            <div> <CircularLoader small /> </div>
                            <div className='ml-3'> Loading configurations...</div>
                        </div>
                    )
                }
                {isDataStoreReportsCreated && me && RenderContent()}
                {RenderListTeiModal()}
                <MyNotification notification={notif} setNotification={setNotif} />
            </div>
        </NextUIProvider>

    )
}

export default App