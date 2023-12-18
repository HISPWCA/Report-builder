import React, { useEffect, useState } from 'react'
import {
    SingleSelect,
    SingleSelectOption,
    Field,
    Button,
    Checkbox,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    CircularLoader,
    NoticeBox,
} from '@dhis2/ui'
import { ORGANISATION_UNITS_ROUTE, ORGANISATION_UNIT_LEVELS_ROUTE, ME_ROUTE, PROGRAMS_ROUTE } from '../api.routes'

import { AGGREGATE, DATA_ELEMENT, DAY, MONTH, PAGE_DESIGN, PAGE_REPORT, QUARTER, TRACKER, WEEK, YEAR } from "../utils/constants"
import OrganisationUnitsTree from './OrganisationUnitsTree'
import { DatePicker } from 'antd'
import { loadDataStore } from '../utils/fonctions'


const PeriodFieldType = ({ setState, state, setSelectedPeriod }) => {

    const handleSelectPeriodType = ({ selected }) => {
        setState(selected)
        setSelectedPeriod(null)
    }

    return (
        <Field label="Period type">
            <SingleSelect
                placeholder='Period type'
                selected={state}
                onChange={handleSelectPeriodType}
            >
                <SingleSelectOption label="Daily" value={DAY} />
                <SingleSelectOption label="Monthly" value={MONTH} />
                <SingleSelectOption label="Yearly" value={YEAR} />
            </SingleSelect>
        </Field>
    )
}

const Filter = ({
    renderPage,
    isDataStoreReportsCreated,
    orgUnits,
    setOrgUnits,
    setOrgUnitLevels,
    setMaxLevel,
    setMinLevel,
    setSelectedOrgUnits,
    loadingOrganisationUnits,
    setLoadingOrganisations,
    selectedReport,
    setSelectedReport,
    setSelectedReportContent,
    setCurrentOrgUnits,
    setExpandedKeys,
    expandedKeys,
    currentOrgUnits,
    setMeOrgUnitId,
    meOrgUnitId,
    setSearchProperties,
    searchProperties,
    searchByAttribute,
    setSearchByAttribute,
    loadingQueryTeiList,
    queryTeiList,
    selectedDataTypeFromHTML,
    setSelectedDataTypeFromHTML,
    programTrackersFromHTML,
    setProgramTrackersFromHTML,
    selectedProgramTrackerFromHTML,
    setSelectedProgramTrackerFromHTML,
    dataTypesFromHTML,
    setDataTypesFromHTML,
    setSelectedPeriod,
    selectedPeriod,
    handleUpdateInformation,
    loadingGetDatas,
    loadingLegendContents,
    setDataElementsFromHTML,
    reports,
    setSelectedPeriodType,
    selectedPeriodType,
    legendContents,
    legends
}) => {
    const [visibleOrgUnit, setVisibleOrgUnit] = useState(false)
    const [programs, setPrograms] = useState([])

    const [loadingPrograms, setLoadingPrograms] = useState(false)
    const [loadingReportContent, setLoadingReportContent] = useState(false)


    const loadOrgUnitLevels = async _ => {
        try {
            setLoadingOrganisations(true)
            const me_request = await fetch(ME_ROUTE.concat(',organisationUnits'))
            const me_response = await me_request.json()

            if (me_response.status === "ERROR")
                throw new me_response

            const userOrganisationUnitId = me_response.organisationUnits.length !== 0 && me_response.organisationUnits[0].id
            if (userOrganisationUnitId) {
                const request = await fetch(ORGANISATION_UNIT_LEVELS_ROUTE)
                const response = await request.json()
                if (response.status === "ERROR")
                    throw response

                const levels = response.organisationUnitLevels.map(lvl => lvl.level)
                const orgLvl = response.organisationUnitLevels.sort((a, b) => a.level - b.level)

                let min = Math.min.apply(null, levels)
                let max = Math.max.apply(null, levels)

                setOrgUnitLevels(orgLvl)
                setMaxLevel(max)
                setMinLevel(min)

                setMeOrgUnitId(userOrganisationUnitId)

                orgLvl.length > 0 && await loadOrganisationUnits(orgLvl)
            }

        } catch (err) {
            setLoadingOrganisations(false)
        }
    }

    const loadPrograms = async _ => {
        try {
            setLoadingPrograms(true)
            const request = await fetch(PROGRAMS_ROUTE
                .concat('?fields=id,name,programTrackedEntityAttributes[id,name, program[id,name], trackedEntityAttribute[id,name,display]]')
                .concat(',programType, displayShortName, programIndicators[id,name]')
                .concat(',programStages[id,name,programStageDataElements[id,dataElement[id,name] ] ]&filter=programType:eq:WITH_REGISTRATION')
            )
            const response = await request.json()
            if (response.status === "ERROR")
                throw response

            const programs = response.programs.map(p => ({ ...p, programTrackedEntityAttributes: p.programTrackedEntityAttributes.map(at => ({ ...at, dataType: p.programType })) }))
            setLoadingPrograms(false)
            setPrograms(programs)
        } catch (err) {
            setLoadingPrograms(false)
        }
    }


    const loadOrganisationUnits = async (orgUnitLevels) => {
        try {
            const requestOU = await fetch(ORGANISATION_UNITS_ROUTE.concat('&fields=id,name,level,parent, path, displayName'))
            const responseOU = await requestOU.json()
            if (responseOU.status === "ERROR")
                throw responseOU

            let newOuArray = []

            for (let level of orgUnitLevels) {
                newOuArray.push({
                    name: level.name,
                    level: level.level,
                    id: level.id,
                    value: null
                })
            }

            setOrgUnits(responseOU.organisationUnits)
            setSelectedOrgUnits(newOuArray)
            setLoadingOrganisations(false)

        } catch (err) {
            setLoadingOrganisations(false)
        }
    }


    const initTrackerProgramsFromHTML = (currentReport) => {
        if (currentReport) {
            let parser = new DOMParser()
            const doc = parser.parseFromString(currentReport.html, 'text/html')
            if (doc) {
                const trackerprog = []
                const data_element_list = []

                const trackerElement = doc.querySelectorAll("[data-type='TRACKER']")
                for (let el of trackerElement) {
                    const id_prog = el.getAttribute('id')?.split('|')?.[0]
                    const data_is = el.getAttribute('data-is')
                    const id_dataElement = el.getAttribute('id')?.split('|')?.[2]

                    if (!trackerprog.includes(id_prog)) {
                        trackerprog.push(id_prog)
                    }

                    if (data_is === DATA_ELEMENT && !data_element_list.includes(id_dataElement)) {
                        data_element_list.push(id_dataElement)
                    }

                }

                setProgramTrackersFromHTML(trackerprog.map(el_id => programs.find(prog_id => prog_id.id === el_id)))
                trackerprog.length > 0 && setSelectedProgramTrackerFromHTML(programs.find(prog_id => prog_id.id === trackerprog[0]))
                data_element_list.length > 0 && setDataElementsFromHTML(data_element_list)
            }
        }
    }

    const initAggregateFromHTML = (currentReport) => {
        if (currentReport) {
            let parser = new DOMParser()
            const doc = parser.parseFromString(currentReport.html, 'text/html')
        }
    }


    const handleSelectReport = async ({ selected }) => {
        try {
            setLoadingReportContent(true)
            setSelectedReport(selected)
            const currentReport = reports.find(r => r.id === selected)
            const currentReportContent = await loadDataStore(`REPORT_${currentReport?.id}`, null, null, {})
            setSelectedReportContent(currentReportContent)

            if (currentReport && currentReportContent) {

                let parser = new DOMParser()
                const doc = parser.parseFromString(currentReportContent.html, 'text/html')
                const aggregateElement = doc.querySelectorAll("[data-type='AGGREGATE']")
                const trackerElement = doc.querySelectorAll("[data-type='TRACKER']")

                let dataTypes = []
                if (aggregateElement.length > 0)
                    dataTypes.push({ id: AGGREGATE.value, name: AGGREGATE.name })

                if (trackerElement.length > 0)
                    dataTypes.push({ id: TRACKER.value, name: TRACKER.name })

                if (dataTypes.length > 1) {
                    setDataTypesFromHTML(dataTypes)
                    setSelectedDataTypeFromHTML(null)
                    setSelectedProgramTrackerFromHTML(null)
                }

                if (dataTypes.length === 1) {

                    if (dataTypes[0].id === AGGREGATE.value) {
                        initAggregateFromHTML(currentReportContent)
                        setSelectedDataTypeFromHTML(dataTypes[0].id)

                        setDataTypesFromHTML([])
                        setSelectedProgramTrackerFromHTML(null)
                    }

                    if (dataTypes[0].id === TRACKER.value) {
                        setSelectedDataTypeFromHTML(dataTypes[0].id)
                        initTrackerProgramsFromHTML(currentReportContent)

                        setDataTypesFromHTML([])
                        setSelectedProgramTrackerFromHTML(null)
                    }
                }
            }

            setLoadingReportContent(false)
        } catch (err) {
            setLoadingReportContent(false)
        }
    }


    const handleCloseOUModal = () => {
        setVisibleOrgUnit(false)
    }

    const OrganisationUnitModal = () => visibleOrgUnit ? <Modal onClose={() => handleCloseOUModal()} large>
        <ModalTitle>
            Organisation Units
        </ModalTitle>
        <ModalContent>
            <div>
                <div className='border p-3 mt-4 rounded'>
                    <h6 className='mt-2'> Select Organisation unit </h6>
                    <OrganisationUnitsTree
                        currentOrgUnits={currentOrgUnits}
                        setCurrentOrgUnits={setCurrentOrgUnits}
                        expandedKeys={expandedKeys}
                        orgUnits={orgUnits}
                        setExpandedKeys={setExpandedKeys}
                        loadingOrganisationUnits={loadingOrganisationUnits}
                        setLoadingOrganisations={setLoadingOrganisations}
                        meOrgUnitId={meOrgUnitId}
                    />
                </div>
                {
                    currentOrgUnits.length > 0 &&
                    (
                        <div style={{ padding: "5px 10px", fontWeight: "bold", borderRadius: "5px", background: "#eee", display: 'flex', alignItems: 'center', justifyContent: 'end', width: '100%' }}>
                            <div className='mr-2'>  Org Unit:</div> <div style={{ fontWeight: "bold", backgroundColor: '#06695C', padding: '2px 5px', borderRadius: "10px", color: "white" }}>{currentOrgUnits[0].name}</div>
                        </div>
                    )
                }
            </div>
        </ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button onClick={() => handleCloseOUModal()} secondary>
                    close
                </Button>
                <Button onClick={() => setVisibleOrgUnit(false)} primary>
                    Ok
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal> : <></>



    const handleSelectedProgramTrackerFromHTML = (selected) => {
        setSelectedProgramTrackerFromHTML(programTrackersFromHTML.find(p => p.id === selected))
        setSearchByAttribute(false)
        setSearchProperties([])
    }

    const handleSelectSearchProperties = (att) => {
        if (!searchProperties.map(s => s.id).includes(att.id)) {
            setSearchProperties([...searchProperties, att])
        } else {
            setSearchProperties(searchProperties.filter(s => s.id !== att.id))
        }
    }

    const TrackerDataTypeContent = () => (
        <>
            {programTrackersFromHTML.length > 0 && <div className='mt-2'>
                <Field label="Program">
                    <SingleSelect
                        placeholder='Select program'
                        selected={selectedProgramTrackerFromHTML?.id}
                        onChange={({ selected }) => handleSelectedProgramTrackerFromHTML(selected)}
                    >
                        {programTrackersFromHTML.map(prog => (
                            <SingleSelectOption key={prog.id} label={prog.name} value={prog.id} />
                        ))}
                    </SingleSelect>
                </Field>
            </div>}


            {
                selectedProgramTrackerFromHTML && (
                    <div className='mt-4'>
                        <div className='py-1 px-2 rounded- font-weight-bold text-center' style={{ backgroundColor: "#06695c", color: '#fff', cursor: "pointer" }} onClick={() => setVisibleOrgUnit(true)}>
                            {currentOrgUnits.length > 0 ? currentOrgUnits[0].name : 'Select organisation unit'}
                        </div>
                    </div>
                )
            }

            {selectedProgramTrackerFromHTML && (
                <div className='mt-3'>
                    <Checkbox
                        label="Search by attributes ?"
                        checked={searchByAttribute}
                        onChange={_ => {
                            !searchByAttribute === false && setSearchProperties([])
                            setSearchByAttribute(!searchByAttribute)
                        }}
                    />
                </div>
            )}

            {searchByAttribute && selectedProgramTrackerFromHTML && (
                <div className='mt-3'>
                    <div className='my-shadow bg-white border rounded p-1'>
                        <div className="border-bottom text-center">
                            <a
                                data-toggle="collapse"
                                style={{ color: "#000", background: "#fff" }}
                                data-target="#searchByAttributeCollapse"
                                aria-expanded="false"
                            >Search on attributes </a>
                        </div>
                        <div className='collapse' id="searchByAttributeCollapse">
                            {
                                selectedProgramTrackerFromHTML?.
                                    programTrackedEntityAttributes?.map(att =>
                                        <Checkbox
                                            checked={searchProperties.map(s => s.id).includes(att.id)}
                                            label={<div style={{ fontSize: "14px", color: "#00000099" }}> {att.trackedEntityAttribute?.name} </div>}
                                            key={att.id} onChange={({ checked }) => handleSelectSearchProperties(att)}
                                        />
                                    )
                            }
                        </div>
                    </div>
                </div>
            )}

            {!searchByAttribute && selectedProgramTrackerFromHTML && (
                <div className='mt-3'>
                    <Button
                        primary
                        disabled={currentOrgUnits.length === 0 ? true : false}
                        loading={loadingQueryTeiList || loadingOrganisationUnits}
                        onClick={queryTeiList}>Update report</Button>
                </div>
            )}
        </>
    )

    const AggregateDataTypeContent = () => (
        <>
            <div className='mt-3'>
                <PeriodFieldType setState={setSelectedPeriodType} state={selectedPeriodType} setSelectedPeriod={setSelectedPeriod} />
            </div>

            <div className='mt-3'>
                <Field label="Period">
                    <DatePicker size='large' picker={selectedPeriodType} placeholder='Period' style={{ width: '100%' }} value={selectedPeriod} onChange={period => setSelectedPeriod(period)} />
                </Field>
            </div>

            <div className='mt-4'>
                <div className='py-1 px-2 rounded- font-weight-bold text-center' style={{ backgroundColor: "#06695c", color: '#fff', cursor: "pointer" }} onClick={() => setVisibleOrgUnit(true)}>
                    {currentOrgUnits.length > 0 ? currentOrgUnits[0].name : 'Select organisation unit'}
                </div>
            </div>

            <div className='mt-3'>
                <Button
                    primary
                    onClick={handleUpdateInformation}
                    disabled={selectedReport && selectedPeriod && currentOrgUnits.length > 0 ? false : true}
                    loading={loadingGetDatas || loadingLegendContents}
                >
                    Update report
                </Button>
            </div>
        </>

    )

    const handleSelectDataTypeFromHTML = ({ selected }) => {
        const currentReport = reports.find(r => r.id === selectedReport)

        if (selected && currentReport) {
            setSelectedDataTypeFromHTML(selected)

            if (selected === AGGREGATE.value)
                initAggregateFromHTML(currentReport)

            if (selected === TRACKER.value)
                initTrackerProgramsFromHTML(currentReport)
        }
    }

    const calculatePercentage = (value, total) => {
        return Math.round(parseInt(value * 100) / total) || 0
    }

    const RenderReportFilter = () => (
        <>
            {
                loadingPrograms || orgUnits.length === 0 || loadingLegendContents ?
                    (
                        <div className='mt-2' style={{ display: 'flex', alignItems: 'center' }}>
                            <CircularLoader small /> <span style={{ marginLeft: '5px' }}>Loading... <span style={{ marginLeft: '5px', color: '#00000090' }}> {calculatePercentage(legendContents.length || 0, legends.length || 0)} %</span></span>
                        </div>
                    ) : (
                        <div>
                            <div className='mt-2'>
                                <Field label="Which report ?">
                                    <SingleSelect
                                        placeholder='Reports'
                                        selected={selectedReport}
                                        onChange={handleSelectReport}
                                    >
                                        {isDataStoreReportsCreated && reports?.map(report => (
                                            <SingleSelectOption label={report.name} value={report.id} />
                                        ))}

                                        {isDataStoreReportsCreated && reports?.length === 0 && <SingleSelectOption label="No Report" />}
                                    </SingleSelect>
                                </Field>
                            </div>
                            {
                                loadingReportContent && (
                                    <div className='d-flex align-items-center mt-2'>
                                        <div> <CircularLoader small /> </div>
                                        <div className='ml-3'> Loading...</div>
                                    </div>
                                )
                            }

                            {
                                dataTypesFromHTML.length > 0 && (
                                    <div className='mt-2'>
                                        <div className='my-2'>
                                            <NoticeBox title="Report">As your report contains tracker and aggregate data , you must generate your report by selecting data type one by one</NoticeBox>
                                        </div>
                                        <Field label="Data Type">
                                            <SingleSelect
                                                placeholder='Reports'
                                                selected={selectedDataTypeFromHTML}
                                                onChange={handleSelectDataTypeFromHTML}
                                            >
                                                {dataTypesFromHTML.map(dataType => (
                                                    <SingleSelectOption label={dataType.name} value={dataType.id} />
                                                ))}
                                            </SingleSelect>
                                        </Field>
                                    </div>
                                )
                            }

                            {selectedDataTypeFromHTML === TRACKER.value && TrackerDataTypeContent()}
                            {selectedDataTypeFromHTML === AGGREGATE.value && AggregateDataTypeContent()}

                            {OrganisationUnitModal()}

                        
                        </div>
                    )
            }
        </>
    )

    const RenderDesignFilter = () => <div className='mt-2'></div>

    useEffect(() => {
        loadOrgUnitLevels()
        loadPrograms()
    }, [])


    switch (renderPage) {
        case PAGE_DESIGN:
            return RenderDesignFilter()

        case PAGE_REPORT:
            return RenderReportFilter()

        default:
            return (
                <></>
            )
    }
}

export default Filter