<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'

import { Search } from 'lucide-vue-next'

defineOptions({ layout: AppLayout })

</script>

<template>
    <AppHead title="Support" description="Support and FAQs" />
    <div class="wrapper">
        <div class="welcome-section"
            :style="{
               backgroundImage: 'url(\'/images/dashboard.webp\')',
            }"
        >
            <h1>WELCOME TO JUVENOTES SUPPORT</h1>
            <div class="search-bar">
                <input type="search" placeholder="Search for help" />
                <Search class="search-icon" />
            </div>
        </div>
        <div class="faq-section">
            <h1>FREQUENTLY ASKED QUESTIONS</h1>
            <div class="faqs">
                <div class="faq">
                    <div class="question">
                        <p>How do I get started?</p>
                    </div>
                    <div class="answer">
                        <p>Simply <a href="/register">create an account</a> to gain access to our vast library of past papers and other revision material. 
                        </p>
                    </div>
                </div>
                <div class="faq">
                    <div class="question">
                        <p>What does Juvenotes offer?</p>
                    </div>
                    <div class="answer">
                        <p>We offer a wide range of study material, past papers, custom and personalised learning paths, together with an active community that promotes learning with peers.
                        </p>
                    </div>
                </div>
                <div class="faq">
                    <div class="question">
                        <p>Is my personal data safe?</p>
                    </div>
                    <div class="answer">
                        <p>Yes, we take your privacy seriously. For more information about how we collect, use
                            and protect your personal information visit the <a href="/privacy">privacy policy</a> page.
                        </p>
                    </div>
                </div>
                <div class="faq">
                    <div class="question">
                        <p>How do I reset my password?</p>
                    </div>
                    <div class="answer">
                        <p>Head over to the <a href="/login">login page</a> and select "forgot password".
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="reach-out-section">
            <h1>CONTACT SUPPORT</h1>
            <a href="mailto:support@juvenotes.com" class="contact-button">Email Us</a>
        </div>
    </div>
</template>

<style>
    div .wrapper{
        display: flex;
        flex-direction: column;
        gap: 3rem;
        background-color: rgba(249, 250, 251, 0.722);
    }
     div .welcome-section{
        background-color: rgba(0, 0, 0, 0.5);
        /* background-image: url('public/images/dashboard.webp'); */
        background-size: cover;
        background-position: center;
        width: 100%;
        height: 288px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
        position: relative;
        opacity: 0.7;
     }
    div .welcome-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        /* z-index: 1; */
    }
     div .welcome-section h1{
        color: rgba(255, 255, 255);
        font-weight: 700;
        font-size: 1.875rem;
        line-height: 2.25rem;
        z-index: 1;
     }
     div .welcome-section .search-bar {
        position: relative;
        display: inline-block;
    }
    div .welcome-section .search-bar input[type="search"] {
        width: 300px;
        padding: 10px 40px 10px 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: rgba(255, 255, 255);
        color: #333;
    }
    div .welcome-section .search-bar .search-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }
    div .faq-section{
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
     div .faq-section h1{
        color: rgb(31, 41, 55);
        font-weight: 700;
        font-size: 1.875rem;
        line-height: 2.25rem;
        text-align: center;
    }
    div .faqs{
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    div .faqs .faq{
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
    }
   
    div .faqs .faq .question{
        display: flex;
        color: rgb(65, 149, 176);
        background-color: rgba(225, 225, 225, 0.722);
        padding: .71em;
    }
    div .faqs .faq .question p{
        font-weight: 600;
        font-size: 1.3em;
    }
    div .faqs .faq .answer{
        padding: 1em;
    }
    div .faqs .faq .answer p{
        font-size: 1.1em;
    }
    div .faqs .faq a{
        text-decoration: none;
        color: rgb(85, 169, 196);
    }
    div .faqs a:hover{
        text-decoration: underline;
    }
    div .reach-out-section h1 {
        color: rgb(31, 41, 55); 
        font-weight: 700;
        font-size: 1.875rem;
        line-height: 2.25rem;
    }
    div .reach-out-section {
        text-align: center;
        margin-top: 2rem;
    }
    div .contact-button {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.8em 1.5em;
        background-color: rgb(85, 169, 196); 
        color: white; 
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    div .contact-button:hover {
        background-color: rgb(65, 149, 176); 
    }

    @media (max-width: 768px) {
        .welcome-section h1 {
            font-size: 1rem;
            line-height: 1.5rem;
            text-align: center;
        }

        .faq-section h1, .reach-out-section h1 {
            font-size: 1rem;
            line-height: 1.5rem;
        }

        .search-bar input[type="search"] {
            padding: 10px 35px 10px 10px;
        }

        .search-bar .search-icon {
            right: 5px;
        }
    }
</style>