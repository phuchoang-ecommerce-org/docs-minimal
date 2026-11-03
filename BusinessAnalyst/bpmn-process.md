# BPMN 2.0 — COD Order and Seller Payment

The source [BPMN 2.0 XML](./diagrams/cod-checkout.bpmn) models the Member, marketplace platform and Seller lanes for checkout and COD payment confirmation. The SVG below is generated from the BPMN-DI coordinates during the documentation build.

![BPMN 2.0 COD checkout and Seller payment process](./diagrams/cod-checkout.svg)

The physical cash handoff is outside the application. The platform stores the COD order and the Seller's later Paid confirmation. No shipping, return or refund task is modeled.

This process traces [UC-04 and UC-07](./use-cases.md), [BR-03, BR-04 and BR-08](./business-rules.md), and the [COD sequence diagrams](../SolutionArchitecture/sequences/README.md). The XML uses the [OMG BPMN 2.0.2 machine-readable format](https://www.omg.org/spec/BPMN/machine-readable).
