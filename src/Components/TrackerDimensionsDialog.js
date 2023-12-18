import { useEffect, useState } from 'react'
import { Transfer } from '@dhis2/ui'
import { PROGRAMS_ROUTE } from '../api.routes'


const DimensionsDialog = ({
    setSelectedPrograms,
    selectedPrograms
}) => {
    const [programs, setPrograms] = useState([])
    const [selectedOptions, setSelectedOptions] = useState([])

    const [loadingPrograms, setLoadingPrograms] = useState(false)

    useEffect(() => {
        loadPrograms()
        selectedPrograms.length > 0 && setSelectedOptions(selectedPrograms.map(p => p.id))
    }, [])


    const getFilterOptions = () => {

        const new_option_list = []

        if (selectedOptions.length > 0) {
            selectedOptions.forEach(el => {
                let object_found = programs.find(p => p.id === el)
                if (object_found)
                    new_option_list.push({ label: object_found.name, value: object_found.id })

            })
        }

        return [...programs.map(program => ({ label: program.name, value: program.id })), ...new_option_list]
    }

    const loadPrograms = async _ => {
        try {
            setLoadingPrograms(true)
            const request = await fetch(PROGRAMS_ROUTE
                .concat('?fields=id,name,programTrackedEntityAttributes[id,name, program[id,name], trackedEntityAttribute[id,name,display,valueType]]')
                .concat(',programType, displayShortName, programIndicators[id,name]')
                .concat(',programStages[id,name,programStageDataElements[id,dataElement[id,name] ] ]&filter=programType:eq:WITH_REGISTRATION')
            )
            const response = await request.json()
            if (response.status === "ERROR")
                throw response

            const programs = response.programs.map(p => ({ ...p, programTrackedEntityAttributes: p.programTrackedEntityAttributes.map(at => ({ ...at, programType: p.programType, program: p.id })) }))
            setLoadingPrograms(false)
            setPrograms(programs)
        } catch (err) {
            setLoadingPrograms(false)
        }
    }

    const handleOnOptionsSelected = ({ selected }) => {
        if (selected) {

            setSelectedOptions(selected)
            if (setSelectedPrograms) {
                let dimensionList = []
                selected.forEach(el => {
                    const object = programs.find(program => program.id === el)
                    if (object) {
                        dimensionList.push(object)
                    }
                })

                setSelectedPrograms(dimensionList)
            }

        }
    }


    return (
        <div className="mt-2" >
            <Transfer
                highlighted={true}
                // leftHeader={RenderLeftHeader}
                loading={loadingPrograms}
                filterLabel="Search Program"
                filterPlaceholder="Search Program"
                filterable
                height="500px"
                onChange={handleOnOptionsSelected}
                options={getFilterOptions()}
                selected={selectedOptions}
            />
        </div>
    )
}


export default DimensionsDialog

