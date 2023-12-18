import React, { useState, useEffect } from 'react'
import DesignsPage from './Components/DesignsPage'
import ReportsPage from './Components/ReportsPage'
import { ANALYTICS_ROUTE, ME_ROUTE, TEIS_ROUTE, ORGANISATION_UNIT_GROUP_ROUTE, USER_GROUPS_ROUTE } from './api.routes'
import { Button, CircularLoader }
    from '@dhis2/ui'
import Filter from './Components/Filter'
import { NOTIFICATON_CRITICAL, PAGE_DESIGN, PAGE_LEGEND, PAGE_REPORT, PAGE_SMS_CONFIG, YEAR } from './utils/constants'

import { cleanAggrateDimensionData, formatPeriodForAnalytic, getAggregateDimensionsList, getOrgUnitParentFromHtml, injectDataIntoHtml, inject_tei_into_html, loadDataStore, updateAndInjectOtherElementPeriod, updateAndInjectSchoolNames } from './utils/fonctions'
import LegendPage from './Components/LegendPage'
import { NextUIProvider, Modal, Table } from '@nextui-org/react';
import SmsConfigPage from './Components/SmsConfigPage'
import MyNotification from './Components/MyNotification'
import { TbReportSearch } from 'react-icons/tb'
import { LuClipboardEdit } from 'react-icons/lu'
import { GrDocumentConfig } from 'react-icons/gr'
import { BiMessageDetail } from 'react-icons/bi'
import axios from 'axios'
import 'antd/dist/reset.css'
import './App.css'

const App = () => {
    const [notif, setNotif] = useState({ show: false, message: null, type: null })

    const [isDataStoreReportsCreated, setDataStoreReportsCreated] = useState(false)
    const [renderPage, setRenderPage] = useState(PAGE_REPORT)
    const [selectedReport, setSelectedReport] = useState(null)
    const [selectedReportContent, setSelectedReportContent] = useState(null)
    const [dataType, setDataType] = useState(null)
    const [dataValues, setDataValues] = useState([])
    const [orgUnits, setOrgUnits] = useState([])
    const [organisationUnitGroups, setOrganisationUnitGroups] = useState([])
    const [orgUnitLevels, setOrgUnitLevels] = useState([])
    const [_, setMaxLevel] = useState(null)
    const [minLevel, setMinLevel] = useState(null)
    const [meOrgUnitId, setMeOrgUnitId] = useState(null)
    const [reports, setReports] = useState([])
    const [legends, setLegends] = useState([])
    const [legendContents, setLegendContents] = useState([])
    const [smsConfigs, setSmsConfigs] = useState([])
    const [expandedKeys, setExpandedKeys] = useState([])
    const [currentOrgUnits, setCurrentOrgUnits] = useState([])
    const [selectedOrgUnits, setSelectedOrgUnits] = useState([])
    const [selectedProgram, setSelectedProgram] = useState(null)

    const [selectedPeriod, setSelectedPeriod] = useState(null)
    const [searchProperties, setSearchProperties] = useState([])

    const [loadingOrganisationUnits, setLoadingOrganisations] = useState(false)
    const [loadingGetDatas, setLoadingGetDatas] = useState(false)
    const [loadingSendDatas, setLoadingSendDatas] = useState(false)
    const [loadingDataStoreInitialization, setLoadingDataStoreInitialization] = useState(false)
    const [loadingSmsConfigs, setLoadingSmsConfigs] = useState(false)
    const [loadingReports, setLoadingReports] = useState(false)
    const [loadingLegendContents, setLoadingLegendContents] = useState(false)

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
    const [appUserGroup, setAppUserGroup] = useState([])

    const initDataStore = async () => {
        try {
            setLoadingDataStoreInitialization(true)
            const legs = await loadDataStore(process.env.REACT_APP_LEGENDS_KEY, null, setLegends, [])
            loadDataStore(process.env.REACT_APP_REPORTS_KEY, setLoadingReports, setReports, [])
            loadDataStore(process.env.REACT_APP_SMS_CONFIG_KEY, setLoadingSmsConfigs, setSmsConfigs, [])

            await loadMe()
            loadOrganisationUnitGroups()

            setLoadingDataStoreInitialization(false)
            setDataStoreReportsCreated(true)
            loadLegendContents(legs)
        } catch (err) {
            setNotif({ show: true, message: err?.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
            setDataStoreReportsCreated(false)
            setLoadingDataStoreInitialization(false)
        }
    }

    const initAppUserGroup = async () => {
        try {
            const existedGroup = await axios.get(`${USER_GROUPS_ROUTE}&fields=id&filter=name:eq:${process.env.REACT_APP_USER_GROUP}`)
            if (existedGroup.data.userGroups.length === 0) {
                await axios.post(`${USER_GROUPS_ROUTE}`, { name: process.env.REACT_APP_USER_GROUP })
                const createdUserGroup = await axios.get(`${USER_GROUPS_ROUTE}&fields=id&filter=name:eq:${process.env.REACT_APP_USER_GROUP}`)

                if (createdUserGroup.data.userGroups.length === 0) {
                    throw new Error("Impossible de créer le group utilisateur")
                }
                setAppUserGroup(createdUserGroup.data.userGroups[0])
            } else {
                setAppUserGroup(existedGroup.data.userGroups[0])
            }
        } catch (err) {
            setNotif({ show: true, message: err.response?.data?.message || err.message, type: NOTIFICATON_CRITICAL })
        }
    }

    const loadLegendContents = async (legendList) => {
        try {
            setLoadingLegendContents(true)
            let list = []
            legendList.forEach(async leg => {
                const content = await loadDataStore(`LEGEND_${leg.id}`, null, null, {})

                list = [...list, content]
                setLegendContents(list)
                if (legendList.length === list.length) {
                    setLoadingLegendContents(false)
                }
            })
            legendList.length === 0 && setLoadingLegendContents(false)

        } catch (err) {
            setLoadingLegendContents(false)
            throw err
        }
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

            const dimensionList = getAggregateDimensionsList(selectedReportContent)
            cleanAggrateDimensionData(selectedReportContent, dimensionList, selectedPeriod, selectedPeriodType, currentOrgUnits[0]?.id, orgUnits, orgUnitLevels, legendContents, organisationUnitGroups)

            if (dimensionList.length > 0) {
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
                        injectDataIntoHtml(response.dataValues, selectedReportContent, orgUnits, orgUnitLevels, currentOrgUnits[0].id, selectedPeriod, selectedPeriodType, setNotif, legendContents)

                    } catch (err) {
                    }
                }
            }

            handleUpdateOtherElement()
            setLoadingGetDatas(false)
        } catch (err) {
            setLoadingGetDatas(false)
        }
    }

    const handleUpdateOtherElement = () => {
        try {
            if (selectedReportContent) {
                updateAndInjectOtherElementPeriod(selectedReportContent, selectedPeriod, selectedPeriodType)
                updateAndInjectSchoolNames(selectedReportContent, currentOrgUnits[0].id, orgUnits, orgUnitLevels)
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
            const request = await fetch(ORGANISATION_UNIT_GROUP_ROUTE.concat('&fields=id,name,displayName,organisationUnits'))

            const response = await request.json()

            if (response.status === "ERROR")
                throw response

            setOrganisationUnitGroups(response.organisationUnitGroups)
        } catch (error) {
            setNotif({ message: error.message, type: NOTIFICATON_CRITICAL, show: true })
        }
    }

    const handleDesignPage = () => {
        setRenderPage(PAGE_DESIGN)
    }

    const handleReportPage = _ => {
        setSelectedReportContent(null)
        setSelectedReport(null)
        setRenderPage(PAGE_REPORT)
    }

    const handleLegendPage = _ => {
        setRenderPage(PAGE_LEGEND)
    }

    const handleSmsConfigPage = _ => {
        setRenderPage(PAGE_SMS_CONFIG)
    }

    const generateTeiReport = (tei) => {
        inject_tei_into_html(selectedReportContent, tei, selectedProgramTrackerFromHTML, setNotif)
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

    const isAuthorised = () => {
        if (me) {
            if (me.authorities?.includes("ALL"))
                return true

            if (me.userGroups?.map(uGrp => uGrp.id)?.includes(appUserGroup?.id))
                return true
        }
        return false
    }

    const RenderContent = () => me && (
        <div className='row' style={{ width: '100%', minHeight: '95vh' }}>
            <div className='col-md-2' style={{ borderRight: '1px solid #ccc' }}>
                <div style={{ position: 'relative', height: '100%' }}>
                    <div className='py-2 px-3' style={{ position: 'sticky', top: '0px' }}>

                        {
                            isAuthorised() && (
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
                            selectedReportContent={selectedReportContent}
                            setSelectedReportContent={setSelectedReportContent}
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
                            loadingLegendContents={loadingLegendContents}
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
                            legendContents={legendContents}
                            legends={legends}
                        />

                    </div>

                    <div style={{ position: 'absolute', bottom: 10, left: 0, textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '10px', color: '#00000050' }}>HWCA / version: {process.env.REACT_APP_VERSION}</div>
                    </div>


                </div>
            </div>
            <div className='col-md-10'>
                <div className='d-flex flex-column justify-content-center'>
                    {
                        renderPage === PAGE_REPORT && (
                            <ReportsPage
                                selectedReport={selectedReportContent}
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
                                lengendContents={legendContents}
                                legends={legends}
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
                                setNotif={setNotif}
                                reports={reports}
                                legends={legends}
                                setLoadingReports={setLoadingReports}
                                setReports={setReports}
                                loadingLegendContents={loadingLegendContents}
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
                                lengendContents={legendContents}
                                setLegendContentss={setLegendContents}
                                setLegends={setLegends}
                                loadingLegendContents={loadingLegendContents}
                                loadLegendContents={loadLegendContents}
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
        initAppUserGroup()
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